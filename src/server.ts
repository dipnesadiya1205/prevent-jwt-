import os from 'os';
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config({ path: `${__dirname}/../.env` });

const app = express();

const jwtKey: string = process.env.JWT_SECRET_KEY || '';

app.get('/testToken', async (req: Request, res: Response) => {
    try {
        const { authorization } = req.headers;

        const jwtToken: any = jwt.verify(authorization, jwtKey);

        const browserDetail = req.headers['user-agent']?.split(' ');
        let isBrowserSame: boolean = false;

        browserDetail?.forEach((el) => {
            if (el.indexOf(jwtToken.browserName) > -1) {
                isBrowserSame = true;
                return;
            }
        });

        const osNetworkIntefaces: any = os.networkInterfaces();
        const macAddress: string = osNetworkIntefaces.wlp1s0[0].mac;
        const isMacAddressSame: boolean = macAddress !== jwtToken.macAddress;

        console.log(macAddress);

        if (!isBrowserSame && !isMacAddressSame) {
            return res.status(400).json({
                message: `You can't access this token !!!`,
            });
        }

        return res.status(200).json({ message: `You can use this token` });
    } catch (error) {
        return res.status(400).json({ api: 'testToken', error });
    }
});

app.get('/generateToken', async (req: Request, res: Response) => {
    try {
        let userAgent: any = req.headers['user-agent'];
        let browserName: string = userAgent.split(' ');

        if (userAgent.indexOf('Firefox') > -1) {
            browserName = 'Firefox';
        } else if (userAgent.indexOf('OPR') > -1) {
            browserName = 'OPR';
        } else if (userAgent.indexOf('Edg') > -1) {
            browserName = 'Edg';
        } else if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Safari') > -1) {
            browserName = 'Chrome';
        } else if (userAgent.indexOf('PostmanRuntime') > -1) {
            browserName = 'PostmanRuntime';
        }

        const osNetworkIntefaces: any = os.networkInterfaces();
        const macAddress: string = osNetworkIntefaces.wlp1s0[0].mac;

        const token: any = jwt.sign({ browserName, macAddress }, jwtKey);

        // req.headers['authorization'] = token;

        return res.status(200).json({ token });
    } catch (error) {
        return res.status(400).json({ api: 'generateToken', error });
    }
});

app.listen(2000, () => {
    console.log('Server is listening on 2000');
});
