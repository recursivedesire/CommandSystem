"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parameter = exports.Command = exports.CommandSystem = void 0;
const _user_1 = require("./api/$user");
class Parameter {
    constructor(name, defaultValue = undefined, regex = /.*/, isVarArgOrFlag = false) {
        this.name = name;
        this.defaultValue = defaultValue;
        this.regex = regex;
        this.isVarArgOrFlag = isVarArgOrFlag;
    }
    validate(value) {
        return this.regex.test(value);
    }
}
exports.Parameter = Parameter;
class Command {
    constructor(name, description, permissions, handler, args = [], opts = []) {
        this.name = name;
        this.description = description;
        this.permissions = permissions;
        this.handler = handler;
        this.args = args;
        this.opts = opts;
    }
    help(showDetails) {
        const commandSyntax = `${this.name} ${this.args.map(a => `<${a.name}>`).join(' ')} ${this.opts.map(o => `[-${o.name}]`).join(' ')}`;
        const commandDescription = this.description;
        const argDescriptions = "Arguments: " + this.args.map(a => a.name).join(', ');
        const optDescriptions = "Options: " + this.opts.map(o => o.defaultValue ? `${o.name} (${o.defaultValue})` : o.name).join(', ');
        return showDetails ? `${commandSyntax}\n${commandDescription}\n${argDescriptions}\n${optDescriptions}` : `${this.name}: ${this.description}`;
    }
    execute(args, opts) {
        try {
            return this.handler(args, opts);
        }
        catch (error) {
            console.log(`Error executing command '${this.name}':`, error);
            return { success: false, message: `An error occurred while executing the command.` };
        }
    }
}
exports.Command = Command;
function matchByName(name, list) {
    let match = list.find(i => i.name === name);
    if (!match) {
        let possibilities = list.filter(i => i.name.startsWith(name));
        if (possibilities.length === 1) {
            match = possibilities[0];
        }
        else if (possibilities.length > 1) {
            return { error: `Ambiguous name, could be any of: ${possibilities.map(i => i.name).join(', ')}` };
        }
    }
    return { match };
}
class CommandSystem {
    constructor(name) {
        this.commands = {};
        this.permissions = [];
        this.name = name;
        this.prefix = name;
        this.register(new Command("help", "Displays a list of available commands or details about a specific command.", [], (args) => ({ success: true, message: this.help(false, args.command) }), [], []));
    }
    register(...commands) {
        for (let command of commands) {
            if (command instanceof CommandSystem) {
                command.prefix = `${this.prefix} ${command.prefix}`;
            }
            this.commands[command.name] = command;
        }
    }
    unregister(...commands) {
        for (let command of commands) {
            delete this.commands[command.name];
        }
    }
    help(showDetails = false, commandName) {
        if (commandName) {
            if (this.commands[commandName]) {
                return this.commands[commandName].help(showDetails);
            }
            else {
                return 'Command not found';
            }
        }
        else {
            let commands = Object.values(this.commands).filter(c => this.hasPermission(c));
            return commands.map(c => (c instanceof CommandSystem) ? c.help() : `${this.prefix} ${c.help(false)}`).join('\n');
        }
    }
    parse(commandString) {
        try {
            if (!commandString.startsWith(this.name)) {
                throw new Error('Invalid command prefix');
            }
            const withoutPrefix = commandString.slice(this.name.length).trim();
            const segments = withoutPrefix.match(/(".*?"|[^"\s]+)+(?=\s*|\s*$)/g) || [];
            let commandName = segments[0] || "help";
            let tokens = segments.slice(1).map(s => s.startsWith('"') && s.endsWith('"') ? s.slice(1, -1) : s);
            let commandMatch = matchByName(commandName, Object.values(this.commands));
            if ('error' in commandMatch) {
                throw new Error(commandMatch.error);
            }
            let command = commandMatch.match;
            if (!command) {
                throw new Error(`Unknown command "${commandName}"`);
            }
            if (!this.hasPermission(command)) {
                throw new Error(`You do not have permission to execute the "${commandName}" command.`);
            }
            if (command instanceof CommandSystem) {
                return command.parse(withoutPrefix);
            }
            let opts = {};
            let args = {};
            let remainingTokens = [];
            for (let i = 0; i < tokens.length; i++) {
                let token = tokens[i];
                if (token.startsWith('-')) {
                    let optName = token.slice(token.startsWith('--') ? 2 : 1);
                    let optMatch = matchByName(optName, command.opts);
                    if ('error' in optMatch) {
                        throw new Error(optMatch.error);
                    }
                    let opt = optMatch.match;
                    if (opt.isVarArgOrFlag) {
                        opts[optName] = true;
                    }
                    else {
                        i++;
                        if (i >= tokens.length) {
                            throw new Error(`Option "${optName}" expects a value but none was provided.`);
                        }
                        opts[optName] = tokens[i];
                    }
                }
                else {
                    remainingTokens.push(token);
                }
            }
            command.opts
                .filter(opt => opts[opt.name] === undefined)
                .forEach(opt => opts[opt.name] = opt.defaultValue);
            if (remainingTokens.length > command.args.length) {
                throw new Error(`Too many arguments provided. Expected ${command.args.length} but got ${remainingTokens.length}.`);
            }
            for (let i = 0; i < command.args.length; i++) {
                let arg = command.args[i];
                if (i >= remainingTokens.length && arg.defaultValue === undefined) {
                    throw new Error(`Missing argument "${arg.name}".`);
                }
                if (i < remainingTokens.length) {
                    if (!arg.validate(remainingTokens[i])) {
                        throw new Error(`Invalid value "${remainingTokens[i]}" for argument "${arg.name}".`);
                    }
                    args[arg.name] = remainingTokens[i];
                }
                else {
                    args[arg.name] = arg.defaultValue;
                }
            }
            return { valid: true, command: command, args, opts };
        }
        catch (err) {
            return { valid: false, error: err.message };
        }
    }
    hasPermission(command) {
        return command.permissions.length === 0 || command.permissions.some(perm => perm === _user_1.$user.username || perm === _user_1.$user.colorGroup);
    }
    execute(commandStringOrParsed) {
        let parsed;
        if (typeof commandStringOrParsed === 'string') {
            parsed = this.parse(commandStringOrParsed);
        }
        else {
            parsed = commandStringOrParsed;
        }
        if (parsed.valid) {
            return parsed.command.execute(parsed.args, parsed.opts);
        }
        else {
            return parsed.error;
        }
    }
}
exports.CommandSystem = CommandSystem;
