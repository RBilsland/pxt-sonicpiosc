/**
 * Custom blocks
 */
//% color="#FF1493" icon="\uf001" weight=90 block="Sonic Pi OSC"
namespace SonicPiOSC {
    let initialised_state: boolean = false
    let wifi_connected_state: boolean = false
    let osc_connected_state: boolean = false

    let maximumCommandTimeout: number = 10000

    /**
    * Return the Initialised State
    */
    //% block="initialised state"
    export function initialisedState(): boolean {
        return initialised_state
    }

    /**
    * Return the WiFi Connected state
    */
    //% block="wifi connected state"
    export function wifiConnectedState(): boolean {
        return wifi_connected_state
    }

    /**
    * Return the OSC Connected State
    */
    //% block="osc connected state"
    export function sonicPiOSCState(): boolean  {
        return osc_connected_state
    }

    /**
     * Initialise the ESP8266
     */
    //% block="initialise|TX = %tx|RX = %rx|baud rate = %baudrate"
    //% tx.defl=SerialPin.P8
    //% rx.defl=SerialPin.P12
    //% baudrate.defl=BaudRate.BaudRate115200
    export function initialise(tx: SerialPin, rx: SerialPin, baudrate: BaudRate): boolean {
        initialised_state = false
        wifi_connected_state = false
        osc_connected_state = false

        serial.redirect(tx, rx, baudrate)    
        serial.setRxBufferSize(128)

        serial.writeString("AT+RESTORE\r\n")
        serial.writeString("AT\r\n")

        let startTime: number = input.runningTime()
        let returnedMessage : string = ""

        while (true) {
            returnedMessage += serial.readString()
            if (returnedMessage.includes("OK")) {
                break
            }
            if (input.runningTime() - startTime > maximumCommandTimeout) {
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
            if (input.runningTime() - startTime > maximumCommandTimeout) {
                return false
            }
        }

        initialised_state = true

        return true
    }

     /**
     * Connect to WiFi
     */
    //% block="connect WiFi|name = %ssid|password = %password"
    export function connectWiFi(ssid: string, password: string): boolean {
        wifi_connected_state = false
        osc_connected_state = false

        if (!initialised_state) {
            return false
        }
        
        serial.writeString("AT+CWMODE=1\r\n")

        let startTime: number = input.runningTime()
        let returnedMessage : string = ""

        while (true) {
            returnedMessage += serial.readString()
            if (returnedMessage.includes("OK")) {
                break
            }
            if (input.runningTime() - startTime > maximumCommandTimeout) {
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
            if (input.runningTime() - startTime > maximumCommandTimeout) {
                return false
            }
        }

        while (true) {
            returnedMessage += serial.readString()
            if (returnedMessage.includes("WIFI GOT IP")) {
                break
            }
            if (input.runningTime() - startTime > maximumCommandTimeout) {
                return false
            }
        }

        while (true) {
            returnedMessage += serial.readString()
            if (returnedMessage.includes("OK")) {
                break
            }
            if (input.runningTime() - startTime > maximumCommandTimeout) {
                return false
            }
        }

        wifi_connected_state = true

        return true
    }

    /**
     * Connect to OSC
     */
    //% block="connect osc|server = %server|port = %port"
    export function connectOSC(server: string, port: number): boolean {
        osc_connected_state = false

        if (!initialised_state || !wifi_connected_state) {
            return false
        }

        serial.writeString("AT+CIPMUX=0\r\n")

        let startTime: number = input.runningTime()
        let returnedMessage : string = ""

        while (true) {
            returnedMessage += serial.readString()
            if (returnedMessage.includes("OK")) {
                break
            }
            if (input.runningTime() - startTime > maximumCommandTimeout) {
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
            if (input.runningTime() - startTime > maximumCommandTimeout) {
                return false
            }
        }

        while (true) {
            returnedMessage += serial.readString()
            if (returnedMessage.includes("OK")) {
                break
            }
            if (input.runningTime() - startTime > maximumCommandTimeout) {
                return false
            }
        }

        osc_connected_state = true

        return true
    }

    /**
    * Send Test Command
    */
    //% block="send test command"
    export function sendTestCommand(): boolean {
        if (!osc_connected_state) {
             return false
        }

        let testCommand: string = "\x2f\x6f\x73\x63\x43\x6f\x6e\x74\x72\x6f\x6c\x2f\x73\x74\x61\x72\x74\x43\x6f\x6e\x6e\x65\x63\x74\x69\x6f\x6e\x2f\x00\x00\x00\x00\x2c\x73\x69\x73\x00\x00\x00\x00\x31\x39\x32\x2e\x31\x36\x38\x2e\x31\x2e\x32\x34\x36\x00\x00\x00\x00\x00\x11\xd0\x4f\x4b\x00\x00"
        
        serial.writeString("AT+CIPSEND=" + testCommand.length + "\r\n")

        let startTime: number = input.runningTime()
        let returnedMessage : string = ""

        while (true) {
            returnedMessage += serial.readString()
            if (returnedMessage.includes("OK")) {
                break
            }
            if (input.runningTime() - startTime > maximumCommandTimeout) {
                return false
            }
        }

        while (true) {
            returnedMessage += serial.readString()
            if (returnedMessage.includes(">")) {
                break
            }
            if (input.runningTime() - startTime > maximumCommandTimeout) {
                return false
            }
        }
    
        serial.writeString(testCommand)

        while (true) {
            returnedMessage += serial.readString()
            if (input.runningTime() - startTime > maximumCommandTimeout) {
                basic.showString(returnedMessage)
                return false
            }
        }

        return true
    }

    // function dumpString(message: string) {
    //     for (let i = 0; i < message.length; i++) {
    //         basic.showNumber(message.charCodeAt(i));
    //     }
    // }
}
