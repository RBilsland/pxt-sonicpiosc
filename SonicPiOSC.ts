/**
 * Custom blocks
 */
//% color="#FF1493" icon="\uf001" weight=90 block="Sonic Pi OSC"
namespace SonicPiOSC {
    let wifi_connected: boolean = false
    let sonicpiosc_connected: boolean = false

    // write AT command with CR+LF ending
    function sendAT(command: string, wait: number = 0) {
        serial.writeString(command + "\u000D\u000A")
        basic.pause(wait)
    }

    // wait for certain response from ESP8266
    function waitResponse(): boolean {
        let serial_str: string = ""
        let result: boolean = false
        let time: number = input.runningTime()
        while (true) {
            serial_str += serial.readString()
            if (serial_str.length > 200)
                serial_str = serial_str.substr(serial_str.length - 200)
            if (serial_str.includes("OK") || serial_str.includes("ALREADY CONNECTED")) {
                result = true
                break
            }
            if (serial_str.includes("ERROR") || serial_str.includes("FAIL")) {
                break
            }
            if (input.runningTime() - time > 5000) {
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
        sendAT("AT+CWMODE=1") // set to STA mode
        sendAT("AT+RST", 1000) // reset
        basic.pause(100)
    }

    /**
    * connect to Wifi router
    */
    //% block="connect wifi|name = %ssid|password = %pw"
    export function connectWifi(ssid: string, pw: string) {

        wifi_connected = false
        sonicpiosc_connected = false
        sendAT("AT+CWJAP=\"" + ssid + "\",\"" + pw + "\"", 0) // connect to Wifi router
        wifi_connected = waitResponse()
        basic.pause(100)
    }

    /**
    * Connect to Sonic Pi OSC
    */
    //% block="connect sonic pi osc server|address = %server"
    export function connectSonicPiOSC(server: string) {
        if (wifi_connected) {
            sonicpiosc_connected = false
            let text = "AT+CIPSTART=\"TCP\",\"" + server + "\",4560"
            sendAT(text, 0) // connect to website server
            sonicpiosc_connected = waitResponse()
            basic.pause(100)
        }
    }

    /**
    * Check if ESP8266 successfully connected to Wifi
    */
    //% block="Wifi connected %State"
    export function wifiState(): boolean {
        return wifi_connected
    }

    /**
    * Check if ESP8266 successfully connected to Sonic Pi OSC
    */
    //% block="SonicPi OSC connected %State"
    export function sonicPiOSCState(): boolean  {
        return sonicpiosc_connected
    }
}
