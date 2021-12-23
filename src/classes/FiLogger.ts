// import * as fs from "fs";
import supportsColor from 'supports-color';
import * as fs from 'fs';

// 
enum colors {
    BLACK = "BLACK",
    BLUE = "BLUE",
    GREEN = "GREEN",
    CYAN = "CYAN",
    RED = "RED",
    MAGENTA = "MAGENTA",
    YELLOW = "YELLOW",
    WHITE = "WHITE",
    CLEAR = "CLEAR"
};
enum logLvl { DEBUG = 0, INFO, WARN, ERROR }
interface IPalette { [key: string]: string; }
enum timestampType { DATE, DATETIME, TIME }

// Custom class for handling logs for application
export default class FiLogger {

    private static Instance: FiLogger; // Singleton instance
    private outputLvl: number = 0; // This variable sets logging output, allowing to hide unwanted logs
    private colorLevel: number = 0;
    private prettyLength: number = 70; // This variable sets maximum line width
    private currentPalette: IPalette | null = null;
    private fileStream: fs.WriteStream;

    private constructor() {
        let color: any = supportsColor.stdout as any;
        this.colorLevel = color["level"];
        this.setPalette(this.colorLevel);
        if (!fs.existsSync("./log")) fs.mkdirSync("./log");
        this.fileStream = fs.createWriteStream(
            "./log/" +
            this.prepareTimestamp(timestampType.DATETIME, ".") +
            ".log"
        );
    }

    /**
     * Gets an instance of FiLogger module. Prevents issues with multiple logs files and keeps code tidier.
     * @returns {FiLogger} FiLogger instance
     */
    public static getInstance(): FiLogger {
        if (!FiLogger.Instance) FiLogger.Instance = new FiLogger();
        return FiLogger.Instance;
    }
    //#region Log formatting functions
    /**
     * Sets color palette for logger output, depending on supported colors
     * @param {number} supportedColorLevel Supported color level from supportsColor
     */
    private setPalette(supportedColorLevel: number): void {
        // 8 color palette used with terminals that supports only 8 colors. This colors may be affected by terminal settings. 
        const palette8: IPalette = {
            BLACK: "\u001b[30m",
            RED: "\u001b[31m",
            GREEN: "\u001b[32m",
            YELLOW: "\u001b[33m",
            BLUE: "\u001b[34m",
            MAGENTA: "\u001b[35m",
            CYAN: "\u001b[36m",
            WHITE: "\u001b[37m",
            CLEAR: "\u001b[0m",
        };
        // 8 color palette used with terminals that supports all 256 colors. This colors are more vibrant and not affected by terminal settings.
        const palette256: IPalette = {
            BLACK: "\u001b[38;5;0m",
            RED: "\u001b[38;5;202m",
            GREEN: "\u001b[38;5;115m",
            YELLOW: "\u001b[38;5;222m",
            BLUE: "\u001b[38;5;111m",
            MAGENTA: "\u001b[38;5;200m",
            CYAN: "\u001b[38;5;51m",
            WHITE: "\u001b[38;5;15m",
            CLEAR: "\u001b[0m",
        };
        this.currentPalette = supportedColorLevel == 0 ? null : (supportedColorLevel == 3 ? palette256 : palette8);
    }

    /**
     * Prepares message for displaying in the output
     * @param {any} args all elements to print
     * @returns {string} prepared message
     */
    private prepareMessage(args: Array<any>): string {
        let preparedMessage: string = "";
        args.forEach((arg: any): void => {
            if (typeof arg === "object") {
                let string: string = JSON.stringify(arg);
                string = string.length > this.prettyLength ? JSON.stringify(arg, null, 1) : string;
                preparedMessage += (preparedMessage.length === 0 ? "" : "\n\t ") + string + (args.length > 1 ? ", " : " ");
            } else preparedMessage += arg + (args.length > 1 ? ", " : " ");
        });
        return preparedMessage;
    }

    /**
     * Prepares timestamp formatted timestamp 
     * Date: DD.MM.YYYY
     * Time: HH:mm:SS
     * Datetime: DD.MM.YYYY_HH:mm:SS
     * @param {timestampType} type choose to return date, time or date-time stamps  
     * @param {string} [separator=":"] separator in timestamp. By default ":", but it should be changed when dealing with filenames 
     * @returns timestamp of selected type
     */
    private prepareTimestamp(type: timestampType, separator?: string): string {
        separator = separator ?? ":";
        let time: Date = new Date();
        let dateStamp: string =
            (time.getDate() < 10 ? "0" + (time.getDate() + 1) : time.getDate() + 1) + "." +
            (time.getMonth() < 10 ? "0" + (time.getMonth() + 1) : time.getMonth() + 1) + "." +
            time.getFullYear();

        let timeStamp: string =
            (time.getHours() < 10 ? "0" + time.getHours() : time.getHours()) + separator +
            (time.getMinutes() < 10 ? "0" + time.getMinutes() : time.getMinutes()) + separator +
            (time.getSeconds() < 10 ? "0" + time.getSeconds() : time.getSeconds());

        if (type === timestampType.DATE) return dateStamp;
        if (type === timestampType.TIME) return timeStamp;
        return dateStamp + "_" + timeStamp;
    }

    /**
     * Surrounds given string with ASCII color escapes codes
     * @param {colors} color Color name
     * @param {string} string Message to color
     * @returns Message enclosed with color ASCII code or message if terminal does not supports colors
     */
    private colorString(color: colors, string: string): string {
        if (this.colorLevel === 0) return string;
        return this.currentPalette![color] + string + this.currentPalette!["CLEAR"];
    }

    /**
     * Write message to the .log file and to output (using console.log)
     * @param {string} title Title of log entry
     * @param {logLvl} level Level of log entry
     * @param {color} color Color in which entry will be written to the console
     * @param {Array<any>} message Message that will be written to as log entry
     */
    private writeMessage(title: string, level: logLvl, color: colors, ...message: Array<any>): void {
        let writableMessage: string = `${this.prepareTimestamp(timestampType.TIME)} [${title}] - ${this.prepareMessage(message)}`;
        this.fileStream.write(writableMessage + "\n");
        if (level >= this.outputLvl) console.log(this.colorString(color, writableMessage));
    }
    //#endregion
    //#region Logging functions
    public debug(...message: any): void { this.writeMessage("DEBUG", logLvl.DEBUG, colors.WHITE, ...message); };
    public info(...message: any): void { this.writeMessage("INFO", logLvl.INFO, colors.BLUE, ...message); };
    public warn(...message: any): void { this.writeMessage("WARN", logLvl.WARN, colors.YELLOW, ...message); };
    public error(...message: any): void { this.writeMessage("ERROR", logLvl.ERROR, colors.RED, ...message); };
    public status(title: string, color: colors, lvl: logLvl, ...message: any): void { this.writeMessage(title, lvl, color, ...message); };
    //#endregion

}

export { colors, logLvl, FiLogger };
