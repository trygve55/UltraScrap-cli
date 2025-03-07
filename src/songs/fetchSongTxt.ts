import { getLoginCookie } from "../utils/login.js";

// POST requests made with this form data skip 25 of waiting time
const txtBody = new FormData();
txtBody.set('wd', "1")

/**
 * Fetches original song txt from database
 * 
 * @param id Song id
 * @returns Song txt as string
 */
export const fetchSongTxt = async (id: string | number) => {
    console.log(getLoginCookie());
    const txt = await fetch(`https://usdb.animux.de/index.php?link=gettxt&id=${id}`, {
        method: "POST",
        headers: {
            'cookie': "_pk_id.yEplKJvn3znLGB5.5ede=2583e13accbbc423.1740702875.; PHPSESSID=89svpmrkkoaf07v8mvlnsaqh7a; _pk_ses.yEplKJvn3znLGB5.5ede=1"//getLoginCookie()
        },
        body: txtBody
    });
    const response = await txt.text();

    return getSongTxtRegex(response);
}
/**
 * Extracts song from HTML site with regex
 * 
 * @param raw HTML file as string
 * @returns Song txt file as string
 */
export const getSongTxtRegex = (raw: string) => {
    const txtRegex = /<textarea.*>((.|\n|\r)*?)</
    console.log(raw);
    console.log(raw.match(txtRegex));
    return raw.match(txtRegex)![1];
}