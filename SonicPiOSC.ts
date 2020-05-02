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
        serial.setRxBufferSize(64)

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

        let testCommand: string = "\u002f\u006f\u0073\u0063\u0043\u006f\u006e\u0074\u0072\u006f\u006c\u002f\u0073\u0074\u0061\u0072\u0074\u0043\u006f\u006e\u006e\u0065\u0063\u0074\u0069\u006f\u006e\u002f\u0000\u0000\u0000\u0000\u002c\u0073\u0069\u0073\u0000\u0000\u0000\u0000\u0031\u0039\u0032\u002e\u0031\u0036\u0038\u002e\u0031\u002e\u0032\u0034\u0036\u0000\u0000\u0000\u0000\u0000\u0011\u00d0"

        basic.showString("AT+CIPSEND=" + testCommand.length + "\r\n")

        serial.writeString("AT+CIPSEND=" + testCommand.length + "\r\n")

        let startTime: number = input.runningTime()
        let returnedMessage : string = ""

        while (true) {
            returnedMessage += serial.readString()
            if (returnedMessage.includes(">")) {
                break
            }
            if (input.runningTime() - startTime > maximumCommandTimeout) {
                return false
            }
        }

        basic.showString(returnedMessage)

        basic.showString(testCommand)

        serial.writeString(testCommand)

        while (true) {
            returnedMessage += serial.readString()
            if (returnedMessage.includes("OK")) {
                break
            }
            if (input.runningTime() - startTime > maximumCommandTimeout) {
                return false
            }
        }
    
        basic.showString(returnedMessage)

        return true
    }

    // function dumpString(message: string) {
    //     for (let i = 0; i < message.length; i++) {
    //         basic.showNumber(message.charCodeAt(i));
    //     }
    // }
}
