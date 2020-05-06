/**
 * Custom blocks
 */
//% color="#FF1493" icon="\uf001" weight=90 block="Sonic Pi OSC"
namespace SonicPiOSC {
    let initialised_state: boolean = false
    let wifi_connected_state: boolean = false
    let osc_connected_state: boolean = false

    let number_of_retries: number = 1
    let command_timeout: number = 10000

    let address_buffer
    let tag_buffer
    let parameter_buffer

    /**
    * Return the number of retries
    */
    //% block="number of retries"
    export function numberOfRetries(): number {
        return number_of_retries
    }

    /**
     * Set the number of retries
     */
    //% block="set number of retries|= %number"
    //% %number.defl=1
    export function setNumberOfRetries(number: number) {
        number_of_retries = number
    }

    /**
    * Return the command timeout
    */
    //% block="command timeout (ms)"
    export function commandTimeout(): number {
        return command_timeout
    }

    /**
     * Set the command timeout
     */
    //% block="set command timeout (ms)|= %number"
    //% %number.defl=10000
    export function setCommandTimeout(number: number) {
        command_timeout = number
    }

    /**
    * Return the Initialised State
    */
    //% block="initialised state"
    export function initialisedState(): boolean {
        return initialised_state
    }

    /**
     * Initialise the ESP8266
     */
    //% block="initialise|TX = %tx|RX = %rx|baud rate = %baudrate"
    //% tx.defl=SerialPin.P8
    //% rx.defl=SerialPin.P12
    //% baudrate.defl=BaudRate.BaudRate115200
    export function initialise(tx: SerialPin, rx: SerialPin, baudrate: BaudRate) {
        let retry_count = 0

        initialised_state = false
        wifi_connected_state = false
        osc_connected_state = false

        while (!initialised_state && retry_count < number_of_retries) {
            initialised_state = performInitialise(tx, rx, baudrate)

            retry_count++
        }
    }

    function performInitialise(tx: SerialPin, rx: SerialPin, baudrate: BaudRate): boolean {
        serial.redirect(tx, rx, baudrate)    
        serial.setRxBufferSize(128)
        serial.setTxBufferSize(128)

        serial.writeString("AT+RESTORE\r\n")
        serial.writeString("AT\r\n")

        let startTime: number = input.runningTime()
        let returnedMessage : string = ""

        while (true) {
            returnedMessage += serial.readString()
            if (returnedMessage.includes("OK")) {
                break
            }
            if (input.runningTime() - startTime > command_timeout) {
                return false
            }
        }

        serial.writeString("AT+RST\r\n")

        startTime = input.runningTime()
        returnedMessage = ""

        while (true) {
            returnedMessage += serial.readString()
            if (returnedMessage.includes("ready")) {
                break
            }
            if (input.runningTime() - startTime > command_timeout) {
                return false
            }
        }

        return true
    }

    /**
    * Return the WiFi Connected state
    */
    //% block="wifi connected state"
    export function wifiConnectedState(): boolean {
        return wifi_connected_state
    }

     /**
     * Connect to WiFi
     */
    //% block="connect WiFi|name = %ssid|password = %password"
    export function connectWiFi(ssid: string, password: string) {
        wifi_connected_state = false
        osc_connected_state = false

        if (initialised_state) {
            let retry_count = 0

            while (!wifi_connected_state && retry_count < number_of_retries) {
                wifi_connected_state = performConnectWiFi(ssid, password)

                retry_count++
            }
        }
    }

    function performConnectWiFi(ssid: string, password: string): boolean {
        serial.writeString("AT+CWMODE=1\r\n")

        let startTime: number = input.runningTime()
        let returnedMessage : string = ""

        while (true) {
            returnedMessage += serial.readString()
            if (returnedMessage.includes("OK")) {
                break
            }
            if (input.runningTime() - startTime > command_timeout) {
                return false
            }
        }

        serial.writeString("AT+CWJAP=\"" + ssid + "\",\"" + password + "\"\r\n")

        startTime = input.runningTime()
        returnedMessage = ""

        while (true) {
            returnedMessage += serial.readString()
            if (returnedMessage.includes("WIFI CONNECTED")) {
                break
            }
            if (input.runningTime() - startTime > command_timeout) {
                return false
            }
        }

        while (true) {
            returnedMessage += serial.readString()
            if (returnedMessage.includes("WIFI GOT IP")) {
                break
            }
            if (input.runningTime() - startTime > command_timeout) {
                return false
            }
        }

        while (true) {
            returnedMessage += serial.readString()
            if (returnedMessage.includes("OK")) {
                break
            }
            if (input.runningTime() - startTime > command_timeout) {
                return false
            }
        }

        return true
    }

    /**
    * Return the OSC Connected State
    */
    //% block="osc connected state"
    export function sonicPiOSCState(): boolean  {
        return osc_connected_state
    }

    /**
     * Connect to OSC
     */
    //% block="connect osc|server = %server|port = %port"
    //% port.defl=4560
    export function connectOSC(server: string, port: number) {
        osc_connected_state = false

        if (initialised_state && wifi_connected_state) {
            let retry_count = 0

            while (!osc_connected_state && retry_count < number_of_retries) {
                osc_connected_state = performConnectOSC(server, port)

                retry_count++
            }
        }
    }

    function performConnectOSC(server: string, port: number): boolean {
        serial.writeString("AT+CIPMUX=0\r\n")

        let startTime: number = input.runningTime()
        let returnedMessage : string = ""

        while (true) {
            returnedMessage += serial.readString()
            if (returnedMessage.includes("OK")) {
                break
            }
            if (input.runningTime() - startTime > command_timeout) {
                return false
            }
        }

        serial.writeString("AT+CIPSTART=\"UDP\",\"" + server + "\"," + port + "," + (port + 1) + ",0\r\n")

        startTime = input.runningTime()
        returnedMessage = ""

        while (true) {
            returnedMessage += serial.readString()
            if (returnedMessage.includes("CONNECT")) {
                break
            }
            if (input.runningTime() - startTime > command_timeout) {
                return false
            }
        }

        while (true) {
            returnedMessage += serial.readString()
            if (returnedMessage.includes("OK")) {
                break
            }
            if (input.runningTime() - startTime > command_timeout) {
                return false
            }
        }

        return true
    }

    /**
     * Start Command
     */
    //% block="start command|address = %address"
    export function startCommand(address: string) {
        if (initialised_state && wifi_connected_state && osc_connected_state) {
            let address_buffer_length = (Math.trunc(address.length / 4) + 1) * 4

            address_buffer = pins.createBuffer(address_buffer_length)
            address_buffer.fill(0)

            for (let buffer_position = 0; buffer_position < address.length; buffer_position++)
            {
                address_buffer.setNumber(NumberFormat.Int8LE, buffer_position, address.charCodeAt(buffer_position))
            }

            // let buffer_position: number = 0

            // for (const c of address) {
            //     address_buffer.setNumber(NumberFormat.Int8LE, buffer_position, c.charCodeAt())
            //     buffer_position++
            // }

            // tag_buffer = pins.createBuffer(1)
            // tag_buffer.setNumber(NumberFormat.Int8LE, 0, 44)
        }
    }

    // /**
    //  * Send Command
    //  */
    // //% block="send command"
    // export function sendCommand() {
    //     if (initialised_state && wifi_connected_state && osc_connected_state) {
    //         let tag_buffer_length = (Math.trunc((tag_buffer.length - 1) / 4) + 1) * 4

    //         let send_buffer = pins.createBuffer(address_buffer.length + tag_buffer_length)
    //         send_buffer.fill(0)

    //         send_buffer.write(0, address_buffer)
    //         send_buffer.write(address_buffer.length, tag_buffer)

    //         serial.writeString("AT+CIPSEND=" + testCommand.length + "\r\n")

    //         let startTime: number = input.runningTime()
    //         let returnedMessage : string = ""
    
    //         while (true) {
    //             returnedMessage += serial.readString()
    //             if (returnedMessage.includes("OK")) {
    //                 break
    //             }
    //             if (input.runningTime() - startTime > command_timeout) {
    //                 basic.showString(returnedMessage)
    //                 return false
    //             }
    //         }
    
    //         while (true) {
    //             returnedMessage += serial.readString()
    //             if (returnedMessage.includes(">")) {
    //                 break
    //             }
    //             if (input.runningTime() - startTime > command_timeout) {
    //                 basic.showString(returnedMessage)
    //                 return false
    //             }
    //         }
    
    //         serial.writeBuffer(testCommand);
    
    //         return true
    //     }
    // }

    /**
    * Send Test Command
    */
    //% block="send test command"
    export function sendTestCommand(): boolean {
        if (!osc_connected_state) {
             return false
        }

        // let testCommand: Array<number> = [0x2f, 0x6f, 0x73, 0x63, 0x43, 0x6f, 0x6e, 0x74, 0x72, 0x6f, 0x6c, 0x2f, 0x73, 0x74, 0x61, 0x72, 0x74, 0x43, 0x6f, 0x6e, 0x6e, 0x65, 0x63, 0x74, 0x69, 0x6f, 0x6e, 0x2f, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x73, 0x69, 0x73, 0x00, 0x00, 0x00, 0x00, 0x31, 0x39, 0x32, 0x2e, 0x31, 0x36, 0x38, 0x2e, 0x31, 0x2e, 0x32, 0x34, 0x36, 0x00, 0x00, 0x00, 0x00, 0x00, 0x11, 0xd0, 0x4f, 0x4b, 0x00, 0x00]
        // let testCommand: string = "\x2f\x6f\x73\x63\x43\x6f\x6e\x74\x72\x6f\x6c\x2f\x73\x74\x61\x72\x74\x43\x6f\x6e\x6e\x65\x63\x74\x69\x6f\x6e\x2f\x00\x00\x00\x00\x2c\x73\x69\x73\x00\x00\x00\x00\x31\x39\x32\x2e\x31\x36\x38\x2e\x31\x2e\x32\x34\x36\x00\x00\x00\x00\x00\x11\xd0\x4f\x4b\x00\x00"
        // let testCommand: string = "TestCommand"
        let testCommand = pins.createBuffer(64);
        testCommand.setNumber(NumberFormat.Int8LE, 0, 0x2F)
        testCommand.setNumber(NumberFormat.Int8LE, 1, 0x6F)
        testCommand.setNumber(NumberFormat.Int8LE, 2, 0x73)
        testCommand.setNumber(NumberFormat.Int8LE, 3, 0x63)
        testCommand.setNumber(NumberFormat.Int8LE, 4, 0x43)
        testCommand.setNumber(NumberFormat.Int8LE, 5, 0x6f)
        testCommand.setNumber(NumberFormat.Int8LE, 6, 0x6e) 
        testCommand.setNumber(NumberFormat.Int8LE, 7, 0x74)
        testCommand.setNumber(NumberFormat.Int8LE, 8, 0x72)
        testCommand.setNumber(NumberFormat.Int8LE, 9, 0x6f)
        testCommand.setNumber(NumberFormat.Int8LE, 10, 0x6c)
        testCommand.setNumber(NumberFormat.Int8LE, 11, 0x2f) 
        testCommand.setNumber(NumberFormat.Int8LE, 12, 0x73) 
        testCommand.setNumber(NumberFormat.Int8LE, 13, 0x74) 
        testCommand.setNumber(NumberFormat.Int8LE, 14, 0x61) 
        testCommand.setNumber(NumberFormat.Int8LE, 15, 0x72) 
        testCommand.setNumber(NumberFormat.Int8LE, 16, 0x74) 
        testCommand.setNumber(NumberFormat.Int8LE, 17, 0x43) 
        testCommand.setNumber(NumberFormat.Int8LE, 18, 0x6f) 
        testCommand.setNumber(NumberFormat.Int8LE, 19, 0x6e) 
        testCommand.setNumber(NumberFormat.Int8LE, 20, 0x6e) 
        testCommand.setNumber(NumberFormat.Int8LE, 21, 0x65) 
        testCommand.setNumber(NumberFormat.Int8LE, 22, 0x63) 
        testCommand.setNumber(NumberFormat.Int8LE, 23, 0x74) 
        testCommand.setNumber(NumberFormat.Int8LE, 24, 0x69) 
        testCommand.setNumber(NumberFormat.Int8LE, 25, 0x6f) 
        testCommand.setNumber(NumberFormat.Int8LE, 26, 0x6e) 
        testCommand.setNumber(NumberFormat.Int8LE, 27, 0x2f) 
        testCommand.setNumber(NumberFormat.Int8LE, 28, 0x00) 
        testCommand.setNumber(NumberFormat.Int8LE, 29, 0x00) 
        testCommand.setNumber(NumberFormat.Int8LE, 30, 0x00) 
        testCommand.setNumber(NumberFormat.Int8LE, 31, 0x00) 
        testCommand.setNumber(NumberFormat.Int8LE, 32, 0x2c) 
        testCommand.setNumber(NumberFormat.Int8LE, 33, 0x73) 
        testCommand.setNumber(NumberFormat.Int8LE, 34, 0x69) 
        testCommand.setNumber(NumberFormat.Int8LE, 35, 0x73) 
        testCommand.setNumber(NumberFormat.Int8LE, 36, 0x00) 
        testCommand.setNumber(NumberFormat.Int8LE, 37, 0x00) 
        testCommand.setNumber(NumberFormat.Int8LE, 38, 0x00) 
        testCommand.setNumber(NumberFormat.Int8LE, 39, 0x00) 
        testCommand.setNumber(NumberFormat.Int8LE, 40, 0x31) 
        testCommand.setNumber(NumberFormat.Int8LE, 41, 0x39) 
        testCommand.setNumber(NumberFormat.Int8LE, 42, 0x32) 
        testCommand.setNumber(NumberFormat.Int8LE, 43, 0x2e) 
        testCommand.setNumber(NumberFormat.Int8LE, 44, 0x31) 
        testCommand.setNumber(NumberFormat.Int8LE, 45, 0x36) 
        testCommand.setNumber(NumberFormat.Int8LE, 46, 0x38) 
        testCommand.setNumber(NumberFormat.Int8LE, 47, 0x2e) 
        testCommand.setNumber(NumberFormat.Int8LE, 48, 0x31) 
        testCommand.setNumber(NumberFormat.Int8LE, 49, 0x2e) 
        testCommand.setNumber(NumberFormat.Int8LE, 50, 0x32) 
        testCommand.setNumber(NumberFormat.Int8LE, 51, 0x34) 
        testCommand.setNumber(NumberFormat.Int8LE, 52, 0x36) 
        testCommand.setNumber(NumberFormat.Int8LE, 53, 0x00) 
        testCommand.setNumber(NumberFormat.Int8LE, 54, 0x00) 
        testCommand.setNumber(NumberFormat.Int8LE, 55, 0x00) 
        testCommand.setNumber(NumberFormat.Int8LE, 56, 0x00) 
        testCommand.setNumber(NumberFormat.Int8LE, 57, 0x00) 
        testCommand.setNumber(NumberFormat.Int8LE, 58, 0x11) 
        testCommand.setNumber(NumberFormat.Int8LE, 59, 0xd0) 
        testCommand.setNumber(NumberFormat.Int8LE, 60, 0x4f) 
        testCommand.setNumber(NumberFormat.Int8LE, 61, 0x4b) 
        testCommand.setNumber(NumberFormat.Int8LE, 62, 0x00) 
        testCommand.setNumber(NumberFormat.Int8LE, 63, 0x00)

        serial.writeString("AT+CIPSEND=" + testCommand.length + "\r\n")

        let startTime: number = input.runningTime()
        let returnedMessage : string = ""

        while (true) {
            returnedMessage += serial.readString()
            if (returnedMessage.includes("OK")) {
                break
            }
            if (input.runningTime() - startTime > command_timeout) {
                basic.showString(returnedMessage)
                return false
            }
        }

        while (true) {
            returnedMessage += serial.readString()
            if (returnedMessage.includes(">")) {
                break
            }
            if (input.runningTime() - startTime > command_timeout) {
                basic.showString(returnedMessage)
                return false
            }
        }

        // serial.writeString(testCommand)
        // serial.writeNumbers(testCommand)
        serial.writeBuffer(testCommand);

        // while (true) {
        //     returnedMessage += serial.readString()
        //     if (input.runningTime() - startTime > maximumCommandTimeout) {
        //         basic.showString(returnedMessage)
        //         return false
        //     }
        // }

        return true
    }

    // function dumpString(message: string) {
    //     for (let i = 0; i < message.length; i++) {
    //         basic.showNumber(message.charCodeAt(i));
    //     }
    // }
}
