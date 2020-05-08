/**
 * 
 */

/**
 * Custom blocks
 */
//% color="#FF1493" icon="\uf001" weight=90 block="Sonic Pi OSC"
namespace SonicPiOSC {
    let initialised_state: boolean = false
    let wifi_connected_state: boolean = false
    let osc_connected_state: boolean = false
    let send_command_state: boolean = false

    let number_of_retries: number = 1
    let command_timeout: number = 10000

    let address_buffer: Buffer
    let tag_buffer: Buffer
    let parameter_buffer: Buffer

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
        send_command_state = false

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
    * Return the Initialised State
    */
    //% block="initialised state"
    export function initialisedState(): boolean {
        return initialised_state
    }

     /**
     * Connect to WiFi
     */
    //% block="connect WiFi|name = %ssid|password = %password"
    export function connectWiFi(ssid: string, password: string) {
        wifi_connected_state = false
        osc_connected_state = false
        send_command_state = false

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
    * Return the WiFi Connected state
    */
    //% block="wifi connected state"
    export function wifiConnectedState(): boolean {
        return wifi_connected_state
    }

    /**
     * Connect to OSC
     */
    //% block="connect osc|server = %server|port = %port"
    //% port.defl=4560
    export function connectOSC(server: string, port: number) {
        osc_connected_state = false
        send_command_state = false

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
    * Return the OSC Connected State
    */
    //% block="osc connected state"
    export function sonicPiOSCState(): boolean  {
        return osc_connected_state
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

            for (let buffer_position = 0; buffer_position < address.length; buffer_position++) {
                address_buffer.setUint8(buffer_position, address.charCodeAt(buffer_position))
                // address_buffer.setNumber(NumberFormat.Int8LE, buffer_position, address.charCodeAt(buffer_position))
            }

            tag_buffer = pins.createBuffer(1)
            tag_buffer.setUint8(0, 44)
            // tag_buffer.setNumber(NumberFormat.Int8LE, 0, 44)

            parameter_buffer = pins.createBuffer(0)
        }
    }

    /**
     * Add String Parameter
     */
    //% block="add string parameter|value = %value"
    export function addStringParameter(value: string) {
        if (initialised_state && wifi_connected_state && osc_connected_state) {
            let new_tag_buffer = pins.createBuffer(tag_buffer.length + 1)

            new_tag_buffer.write(0, tag_buffer)
            // new_tag_buffer.setNumber(NumberFormat.Int8LE, new_tag_buffer.length - 1, 115)
            new_tag_buffer.setUint8(new_tag_buffer.length - 1, 115)

            tag_buffer = new_tag_buffer

            let parameter_value_length = (Math.trunc(value.length / 4) + 1) * 4
            let new_parameter_buffer = pins.createBuffer(parameter_buffer.length + parameter_value_length)

            new_parameter_buffer.fill(0)
            new_parameter_buffer.write(0, parameter_buffer)

            for (let buffer_position = 0; buffer_position < parameter_value_length; buffer_position++) {
                // new_parameter_buffer.setNumber(NumberFormat.Int8LE, parameter_buffer.length + buffer_position, value.charCodeAt(buffer_position))
                new_parameter_buffer.setUint8(parameter_buffer.length + buffer_position, value.charCodeAt(buffer_position))
            }

            parameter_buffer = new_parameter_buffer
        }
    }

    /**
     * Add Int Parameter
     */
    //% block="add int parameter|value = %value"
    export function addIntParameter(value: number) {
        if (initialised_state && wifi_connected_state && osc_connected_state) {
            let new_tag_buffer = pins.createBuffer(tag_buffer.length + 1)

            new_tag_buffer.write(0, tag_buffer)
            // new_tag_buffer.setNumber(NumberFormat.Int8LE, new_tag_buffer.length - 1, 105)
            new_tag_buffer.setUint8(new_tag_buffer.length - 1, 105)

            tag_buffer = new_tag_buffer

            let parameter_value_length = 4
            let new_parameter_buffer = pins.createBuffer(parameter_buffer.length + parameter_value_length)

            new_parameter_buffer.fill(0)
            new_parameter_buffer.write(0, parameter_buffer)
            new_parameter_buffer.setNumber(NumberFormat.Int32BE, parameter_buffer.length, value)

            parameter_buffer = new_parameter_buffer
        }
    }

    /**
     * Add Float Parameter
     */
    //% block="add float parameter|value = %value"
    export function addFloatParameter(value: number) {
        if (initialised_state && wifi_connected_state && osc_connected_state) {
            let new_tag_buffer = pins.createBuffer(tag_buffer.length + 1)

            new_tag_buffer.write(0, tag_buffer)
            // new_tag_buffer.setNumber(NumberFormat.Int8LE, new_tag_buffer.length - 1, 102)
            new_tag_buffer.setUint8(new_tag_buffer.length - 1, 102)

            tag_buffer = new_tag_buffer

            let parameter_value_length = 4
            let new_parameter_buffer = pins.createBuffer(parameter_buffer.length + parameter_value_length)

            new_parameter_buffer.fill(0)
            new_parameter_buffer.write(0, parameter_buffer)
            new_parameter_buffer.setNumber(NumberFormat.Float32BE, parameter_buffer.length, value)

            parameter_buffer = new_parameter_buffer
        }
    }

    /**
     * Send Command
     */
    //% block="send command"
    export function sendCommand() {
        send_command_state = false

        if (initialised_state && wifi_connected_state && osc_connected_state) {
            let retry_count = 0

            while (!send_command_state && retry_count < number_of_retries) {
                send_command_state = performSendCommand()

                retry_count++
            }
        }
    }

    export function performSendCommand(): boolean {
        let tag_buffer_length = (Math.trunc((tag_buffer.length - 1) / 4) + 1) * 4

        // let send_buffer = pins.createBuffer(address_buffer.length + tag_buffer_length)
        let send_buffer = pins.createBuffer(address_buffer.length + tag_buffer_length + parameter_buffer.length)
        send_buffer.fill(0)

        send_buffer.write(0, address_buffer)
        send_buffer.write(address_buffer.length, tag_buffer)
        send_buffer.write(address_buffer.length + tag_buffer_length, parameter_buffer)

        serial.writeString("AT+CIPSEND=" + send_buffer.length + "\r\n")

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

        serial.writeBuffer(send_buffer)

        return true
    }

    /**
    * Return the Send Command State
    */
    //% block="send command state"
    export function sendCommandState(): boolean {
        return send_command_state
    }

    /**
    * Return the number of retries
    */
    //% block="number of retries"
    //% advanced=true
    export function numberOfRetries(): number {
        return number_of_retries
    }

    /**
     * Set the number of retries
     */
    //% block="set number of retries|= %number"
    //% %number.defl=1
    //% advanced=true
    export function setNumberOfRetries(number: number) {
        number_of_retries = number
    }

    /**
    * Return the command timeout
    */
    //% block="command timeout (ms)"
    //% advanced=true
    export function commandTimeout(): number {
        return command_timeout
    }

    /**
     * Set the command timeout
     */
    //% block="set command timeout (ms)|= %number"
    //% %number.defl=10000
    //% advanced=true
    export function setCommandTimeout(number: number) {
        command_timeout = number
    }
}
