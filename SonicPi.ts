/**
 * Custom blocks
 */
//% color=#FF3092 weight=90 icon="\uf001" block="Sonic Pi"

namespace SonicPI {

    let wifi_connected: boolean = false
    let sonicpiosc_connected: boolean = false
    let last_upload_successful: boolean = false
    let userToken_def: string = ""
    let topic_def: string = ""
    let recevice_kidiot_text = ""
    const EVENT_ON_ID = 100
    const EVENT_ON_Value = 200
    const EVENT_OFF_ID = 110
    const EVENT_OFF_Value = 210
    let toSendStr = ""

    export enum State {
        //% block="Success"
        Success,
        //% block="Fail"
        Fail
    }

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
    //% block="set ESP8266|RX %tx|TX %rx|Baud rate %baudrate"
    //% tx.defl=SerialPin.P8
    //% rx.defl=SerialPin.P12
    //% ssid.defl=your_ssid
    //% pw.defl=your_password
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
    //% block="connect Wifi SSID = %ssid|KEY = %pw"
    //% ssid.defl=your_ssid
    //% pw.defl=your_pw
    export function connectWifi(ssid: string, pw: string) {

        wifi_connected = false
		sonicpiosc_connected = false
        sendAT("AT+CWJAP=\"" + ssid + "\",\"" + pw + "\"", 0) // connect to Wifi router
        wifi_connected = waitResponse()
        basic.pause(100)
    }

    /**
    * Connect to SonicPiOSC
    */
    //% block="connect SonicPi OSC|Host = %host"
    export function connectSonicPiOSC(host: string) {
        if (wifi_connected) {
            sonicpiosc_connected = false
            let text = "AT+CIPSTART=\"UDP\",\"" + host + "\",4560"
            sendAT(text, 0) // connect to Sonic Pi OSC server
            sonicpiosc_connected = waitResponse()
            basic.pause(100)
        }
    }

    /**
    * Send OSC message to Sonic Pi
    */
    //% block="Send OSC Message|Message = %message"
    export function SendOSCMessage(message: string) {
        if (sonicpiosc_connected) {
            sendAT("AT+CIPSEND=" + (message.length + 2), 100)
            sendAT(message, 100) // upload data
            basic.pause(100)
        }
    }

    /**
    * Send OSC test message to Sonic Pi
    
    //% block="Send OSC Test Message"
    export function SendOSCTestMessage() {
        if (sonicpiosc_connected) {
            message = 0x2f + 0x6f + 0x73 + 0x63 + 0x69 + 0x6c + 0x6c + 0x61 + 0x74 + 0x6f + 0x72 + 0x2f + 0x34 + 0x2f + 0x66 + 0x72 + 0x65 + 0x71 + 0x75 + 0x65 + 0x6e + 0x63 + 0x79 + 0x00 + 0x2c + 0x66 + 0x00 + 0x00 + 0x43 + 0xdc + 0x00 + 0x00
            sendAT("AT+CIPSEND=" + (message.length + 2), 100)
            sendAT(message, 100) // upload data
            basic.pause(100)
        }
    }   
    */
   
    /**
     * Return wifi_connected
     */
    //% block="WiFi Connected Status"
    export function WiFiConnected(): string {
        return wifi_connected.toString()
    }

    /**
     * Return sonicpiosc_connected
     */
    //% block="SonicPi OSC Connected Status"
    export function SonicPiOSCConnected(): string {
        return sonicpiosc_connected.toString()
    }
}
