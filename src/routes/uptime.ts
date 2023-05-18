import express, { Request, Response } from "express";


const router = express.Router();

// Uptime calculation
const startTime = Date.now();

function getUptime() {
    const uptime = Date.now() - startTime;
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    return {
        seconds,
        minutes,
        hours,
        days,
    };
}

function formatUptime(uptime: { seconds: number; minutes: number; hours: number; days: number }): string {
    const { seconds, minutes, hours, days } = uptime;

    const totalSeconds = days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds;
    const formattedTime = [];

    const numHours = Math.floor(totalSeconds / 3600);
    const numMinutes = Math.floor((totalSeconds % 3600) / 60);
    const numSeconds = Math.floor(totalSeconds % 60);

    if (numHours > 0) {
        formattedTime.push(`${numHours} hour${numHours !== 1 ? 's' : ''}`);
    }
    if (numMinutes > 0) {
        formattedTime.push(`${numMinutes} minute${numMinutes !== 1 ? 's' : ''}`);
    }
    if (numSeconds > 0) {
        formattedTime.push(`${numSeconds} second${numSeconds !== 1 ? 's' : ''}`);
    }

    return formattedTime.join(', ');
}


router.get('/', (req, res) => {
    const uptime = getUptime();
    const formattedUptime = formatUptime(uptime);
    res.send(`API Uptime: ${formattedUptime}`);
});




export const uptimeHandler = router;
