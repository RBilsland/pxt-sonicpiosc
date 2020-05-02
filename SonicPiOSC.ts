/**
 * Custom blocks
 */
//% color="#FF1493" icon="\uf001" weight=90 block="Sonic Pi OSC"
namespace SonicPiOSC {
    let wifi_connected: boolean = false
    let sonicpiosc_connected: boolean = false
    let last_send_successful: boolean = false

    let maximumCommandTimeout: number = 10000

    // write AT command with CR+LF ending
    function sendAT(command: string, wait: number = 0) {
        serial.writeString(command + "\u000D\u000A")
        basic.pause(wait)
    }

    // wait for certain response from ESP8266
    function waitResponse(dump: boolean): boolean {
        let serial_str: string = ""
        let result: boolean = false
        let time: number = input.runningTime()
        while (true) {
            serial_str += serial.readString()
            // if (serial_str.length > 200)
            //     serial_str = serial_str.substr(serial_str.length - 200)
            if (serial_str.includes("OK") || serial_str.includes("ALREADY CONNECTED")) {
                result = true
                if (dump) {
                    dumpString(serial_str)
                }
                basic.showString("OK")
                break
            }
            if (serial_str.includes("ERROR") || serial_str.includes("FAIL")) {
                if (dump) {
                    dumpString(serial_str)
                }
                basic.showString("ERROR")
                break
            }
            if (input.runningTime() - time > 100000) {
                if (dump) {
                    dumpString(serial_str)
                }
                basic.showString("TIME")
                break
            }
        }
        return result
    }

    /**
    * Initialize ESP8266 module 
    */
    //% block="set ESP8266|TX = %tx|RX = %rx|baud rate = %baudrate"
    //% tx.defl=SerialPin.P8
    //% rx.defl=SerialPin.P12
    export function initWIFI(tx: SerialPin, rx: SerialPin, baudrate: BaudRate) {
        serial.redirect(
            tx,
            rx,
            baudrate
        )
        sendAT("AT+RESTORE", 1000) // restore to factory settings
        sendAT("AT+CWMODE=3", 1000) // set to STA mode
        //sendAT("AT+RST", 1000) // reset
        basic.pause(100)
    }

    /**
    * connect to Wifi router
    */
    //% block="connect wifi|name = %ssid|password = %pw"
    export function connectWifi(ssid: string, pw: string) {

        wifi_connected = false
        sonicpiosc_connected = false
        sendAT("AT+CWJAP=\"" + ssid + "\",\"" + pw + "\"", 1) // connect to Wifi router
        wifi_connected = waitResponse(false)
        basic.pause(100)
    }

    /**
    * Connect to Sonic Pi OSC
    */
    //% block="connect sonic pi osc server|address = %server"
    export function connectSonicPiOSC(server: string) {
        if (wifi_connected) {
            sonicpiosc_connected = false
            let text="AT+CIPMUX=1"
            sendAT(text, 1000)
            let wibble = waitResponse(false)
            text = "AT+CIPSTART=0,\"UDP\",\"" + server + "\",4560,4560,2"
            sendAT(text, 1) // connect to website server
            // let toSendStr: string = '\u002f\u006f\u0073\u0063\u0043\u006f\u006e\u0074\u0072\u006f\u006c\u002f\u0073\u0074\u0061\u0072\u0074\u0043\u006f\u006e\u006e\u0065\u0063\u0074\u0069\u006f\u006e\u002f\u0000\u0000\u0000\u0000\u002c\u0073\u0069\u0073\u0000\u0000\u0000\u0000\u0031\u0039\u0032\u002e\u0031\u0036\u0038\u002e\u0031\u002e\u0032\u0034\u0036\u0000\u0000\u0000\u0000\u0000\u0011\u00d0'
            // sendAT("AT+CIPSEND=" + (toSendStr.length + 2), 100)
            // sendAT(toSendStr, 100) // upload data
            sonicpiosc_connected = waitResponse(true)
            basic.pause(100)
        }
    }

    /**
    * Connect to Sonic Pi OSC
    */
    //% block="send start connection"
    export function sendStartConnection() {
        if (sonicpiosc_connected) {
            last_send_successful = false
            let toSendStr: string = '\u002f\u006f\u0073\u0063\u0043\u006f\u006e\u0074\u0072\u006f\u006c\u002f\u0073\u0074\u0061\u0072\u0074\u0043\u006f\u006e\u006e\u0065\u0063\u0074\u0069\u006f\u006e\u002f\u0000\u0000\u0000\u0000\u002c\u0073\u0069\u0073\u0000\u0000\u0000\u0000\u0031\u0039\u0032\u002e\u0031\u0036\u0038\u002e\u0031\u002e\u0032\u0034\u0036\u0000\u0000\u0000\u0000\u0000\u0011\u00d0'
            sendAT("AT+CIPSEND=" + (toSendStr.length + 2), 100)
            sendAT(toSendStr, 100) // upload data
            last_send_successful = waitResponse(true)
            basic.pause(100)
        }
    }

    /**
    * Check if ESP8266 successfully connected to Wifi
    */
    //% block="wifi connected"
    export function wifiState(): boolean {
        return wifi_connected
    }

    /**
    * Check if ESP8266 successfully connected to Sonic Pi OSC
    */
    //% block="sonic pi osc connected"
    export function sonicPiOSCState(): boolean  {
        return sonicpiosc_connected
    }

    /**
    * Check if ESP8266 successfully sent the last command
    */
    //% block="last send successful"
    export function lastSendSuccessful(): boolean  {
        return last_send_successful
    }

    function dumpString(message: string) {
        for (let i = 0; i < message.length; i++) {
            basic.showNumber(message.charCodeAt(i));
        }
    }

    /**
     * Test Communications with the ESP8266
     */
    //% block="test communications|TX = %tx|RX = %rx|baud rate = %baudrate"
    //% tx.defl=SerialPin.P8
    //% rx.defl=SerialPin.P12
    export function testCommunications(tx: SerialPin, rx: SerialPin, baudrate: BaudRate): boolean {
        serial.redirect(tx, rx, baudrate)    

        serial.writeString("AT+RESTORE\r\n")
        serial.writeString("AT\r\n")

        let startTime: number = input.runningTime()
        let returnedMessage : string = ""

        while (true) {
            returnedMessage += serial.readString()
            if (returnedMessage.includes("OK")) {
                return true
            }
            if (input.runningTime() - startTime > maximumCommandTimeout) {
                return false
            }
        }
    }

    /**
     * Reset the ESP8266
     */
    //% block="reset"
    export function reset(): boolean {
        serial.writeString("AT+RST\r\n")

        let startTime: number = input.runningTime()
        let returnedMessage : string = ""

        while (true) {
            returnedMessage += serial.readString()
            if (returnedMessage.includes("ready")) {
                return true
            }
            if (input.runningTime() - startTime > maximumCommandTimeout) {
                basic.showString(returnedMessage)
                return false
            }
        }
    }

    /**
     * Set the ESP8266 client mode
     */
    //% block="client mode"
    export function clientMode(): boolean {
        serial.writeString("AT+CWMODE=1\r\n")

        let startTime: number = input.runningTime()
        let returnedMessage : string = ""

        while (true) {
            returnedMessage += serial.readString()
            if (returnedMessage.includes("OK")) {
                return true
            }
            if (input.runningTime() - startTime > maximumCommandTimeout) {
                return false
            }
        }
    }

    /**
     * Set the ESP8266 version
     */
    //% block="version"
    export function version(): boolean {
        serial.writeString("AT+GMR\r\n")

        let startTime: number = input.runningTime()
        let returnedMessage : string = ""

        while (true) {
            returnedMessage += serial.readString()
            if (returnedMessage.includes("OK")) {
                basic.showString(returnedMessage)
                return true
            }
            if (input.runningTime() - startTime > maximumCommandTimeout) {
                return false
            }
        }
    }

    /**
     * update
     */
    //% block="update"
    export function update(): boolean {
        serial.writeString("AT+CIUPDATE\r\n")

        while (true) {
            basic.showString(serial.readString)

            if(1 == 2) {
                return true
            }
        }
    }

     /**
     * Join an access point
     */
    //% block="join access point|name = %ssid|password = %password"
    export function joinAccessPoint(ssid: string, password: string): boolean {
        serial.writeString("AT+CWJAP=\"" + ssid + "\",\"" + password + "\"\r\n")

        let startTime: number = input.runningTime()
        let returnedMessage : string = ""

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
                return true
            }
            if (input.runningTime() - startTime > maximumCommandTimeout) {
                return false
            }
        }
    }

    /**
     * Open UDP port
     */
    //% block="open udp port|address = %address|port = %port"
    export function openUDPPort(address: string, port: number): boolean {
        serial.writeString("AT+CIPMUX=0\r\n")

        let startTime: number = input.runningTime()
        let returnedMessage : string = ""

        while (true) {
            returnedMessage += serial.readString()
            if (returnedMessage.includes("OK")) {
                break
            }
            if (input.runningTime() - startTime > maximumCommandTimeout) {
                basic.showString("A")
                basic.showString(returnedMessage)
                return false
            }
        }

        serial.writeString("AT+CIPSTART=\"UDP\",\"" + address + "\"," + port + ",44553,0\r\n")

        startTime = input.runningTime()
        returnedMessage = ""

        while (true) {
            returnedMessage += serial.readString()
            if (returnedMessage.includes("CONNECT")) {
                break
            }
            if (input.runningTime() - startTime > maximumCommandTimeout) {
                basic.showString("A")
                basic.showString(returnedMessage)
                return false
            }
        }

        while (true) {
            returnedMessage += serial.readString()
            if (returnedMessage.includes("OK")) {
                return true
            }
            if (input.runningTime() - startTime > maximumCommandTimeout) {
                basic.showString("A")
                basic.showString(returnedMessage)
                return false
            }
        }
    }
}
