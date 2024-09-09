import bcrypt from "bcryptjs";
import {AndrebotModel} from "../models/andrebotmodel"

const model = new AndrebotModel();

export interface UserEntry {
    username: string, platform: string;
};

export interface rankEntry extends UserEntry {
    wins: number;
    anon_username: string;
};

export interface Victory_event {
    username: string,
    loser_username: string,
    word: string,
    platform: string,
    attempts: number,
}

export class andrebotServices {

    testauth(): boolean {
        return true;
    }

    async getHash(password: string){
        return await bcrypt.hash(password, 10);
    }

    async auth(username: string, password: string): Promise<boolean> {
        const hashed = await model.authAdmin(username);
        
        return bcrypt.compareSync(password, hashed);
    }

    async getRank(showPlatforms: Array<string>){
        const rows = await model.getRank();

        let filtered: Array<rankEntry> = rows.map((value: rankEntry) => {
            const newname = value.platform in showPlatforms ? value.username: value.anon_username;
            value.username = newname;
            return value;
        });

        return filtered;

    }

    async addWinner(event: Victory_event){
        if (!(['discord', 'telegram'].includes(event.platform))){
            return;
        }
        await model.addWinner(event.username,event.loser_username,event.word,event.platform,event.attempts);
    }

    async addWinners(events: Array<Victory_event>){
        await events.map(this.addWinner);
    }
}

