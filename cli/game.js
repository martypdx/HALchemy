
const inquirer = require('inquirer');
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');



const prompt = (message) => {
    return {
        type: 'input',
        name: 'answer',
        message: message,
    };
};

const authPrompts = [
    {
        type: 'input',
        name: 'name',
        message: 'Please verify your username:'
    },
    {
        type: 'password',
        name: 'password',
        mask: '*',
        message: 'Confirmed. Please verify your password:',
    }
];

class Game {
    constructor(api) {
        this.api = api;
        this.ship = {};
        this.signup = false;
        this.token;
    }

    start() {
        clear();
        console.log(
            chalk.green(
                figlet.textSync('HALCHEMY', { horizontalLayout: 'fitted' })
            )
        );
        inquirer
            .prompt(prompt('Hello. My name is HAL.'))
            .then(() => this.askAuthChoice());
    }

    askAuthChoice() {
        inquirer
            .prompt(prompt('Is this the first time we have interacted?'))
            .then(({ answer }) => {
                answer = answer.toLowerCase();
                if(answer.match(/n/)) {
                    console.log('I have retrieved our previous communication logs. I will still need to run a mental diagnostic.');
                    this.askAuth();
                }
                else if(answer.match(/maybe/)) {
                    console.log('The cryostasis may have negatively affected your memory. Try to recall.');
                    this.askAuthChoice();
                }
                else if(answer.match(/y/)) {
                    console.log('To ensure mental fidelity, please answer a few questions.');
                    this.signup = true;
                    this.askAuth();
                }
                else {
                    console.log('It is imperative that you answer the question.');
                    this.askAuthChoice();
                }
            });
    }

    askAuth() {
        inquirer
            .prompt(authPrompts)
            .then(({ name, password }) => {
                if(this.signup) return this.api.signup({ name, password });
                else return this.api.signin({ name, password });
            })
            .then(() => {
                return this.api.getShip();
            })
            .then(ship => {
                this.ship = ship;
                this.startDialogue();
            });
    }

    startDialogue() {
        return this.api.getStage(this.ship.stage)
            .then(data => {
                console.log('Excellent. Your identity has been verified. \n I will commence the debriefing of the current mission status...');
                return inquirer
                    .prompt(prompt('data.intro'))
                    .then(({ answer }) => {
                        this.generateResponse(answer);
                    });
            });
    }

    generateResponse(input) {
        return this.api.parseIntent(input)
            .then(intent => {
                return this.api.think(intent, this.ship.mood);
            })
            .then(body => {
                const response = body.output.response;
                if(body.continue === '2a') {
                    this.flyThroughAsteroids(body);
                }
                else if(body.continue === '2b') {
                    this.flyAroundAsteroids(body);
                }
                else if(body.continue === '4') {
                    this.arriveAtEarth(response);
                }
                else if(body.continue === '6') {
                    this.die(response);
                }
                else return inquirer.prompt(prompt(response));
            })
            .then(({ answer }) => {
                this.generateResponse(answer);
            });
    }

    flyThroughAsteroids(body) {
        // console.log(body.output.response);
        // console.log('MOVING ON TO STAGE', body.continue);
        // update stage #
        // get stage info
        // update ship stats


        return this.api.updateStage(body.continue)
            .then(() => inquirer.prompt(prompt('shields are low what do we do?')));
    }

    flyAroundAsteroids(body) {

    }

    arriveAtEarth(response) {
        console.log(response);
        console.log('\n\nYou WIN!');
        // update stages with success
        // this.api.updateLeaderboard;
        this.api.deleteShip();
    }

    die(response) {
        console.log(response);
        console.log('\n\nYou died!');
        // update stages with failure
        this.api.deleteShip();
    }




}




module.exports = Game;