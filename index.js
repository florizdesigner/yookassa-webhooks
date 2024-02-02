const express = require('express')
const axios = require('axios')
const xml = require('xml')

const app = express()
app.use(express.json())
app.use(express.urlencoded())

const telegramSendMessage = async (text, chat_id) => {
    const options = {
        method: 'POST',
        url: `https://api.telegram.org/bot6751744282:AAHAg-z-Bud7c5U--KUv8UJtr5QSWBEvjkc/sendMessage`,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        data: {
            "chat_id": chat_id,
            "text":"<code>" + JSON.stringify(text, null, '\t') + "</code>",
            "disable_web_page_preview":true,
            "disable_notification":true,
            "parse_mode": "HTML"
        }
    };


    try {
        return await axios.request(options)
    } catch (e) {
        console.log(e.data)
        return e
    }
}

app.get('*', (req, res) => {
    res.send('<html><h1>404 Not Found</h1></html>')
})

app.post('/webhook', async (req, res) => {
    if (req.headers['content-type'] === 'application/x-www-form-urlencoded; charset=UTF-8') {
        // commonHttp30
        if (req.body.action === 'checkOrder') {
            const response = xml([ { checkOrderResponse: { _attr: { performedDatetime: new Date().toISOString().split('Z')[0] + '+03:00', code: '0', invoiceId: req.body.invoiceId, shopId: req.body.shopId }}}])
            console.log(encodeURI(response))

            const text = {
                action: "checkOrder",
                request: req.body,
                response: response.replace('\\', '').replace('<', '&lt;').replace('>', '&gt;')
            }

            if (req.body.chat_id) await telegramSendMessage(text, req.body.chat_id)

            res.header('Content-Type', 'text/xml');
            res.send(response)
        } else if (req.body.action === 'paymentAviso') {
            const response = xml([ { paymentAvisoResponse: { _attr: { performedDatetime: new Date().toISOString().split('Z')[0] + '+03:00', code: '0', invoiceId: req.body.invoiceId, shopId: req.body.shopId }  } } ])

            const text = {
                action: "paymentAviso",
                request: req.body,
                response: response.replace('\\', '').replace('<', '&lt;').replace('>', '&gt;')
            }

            if (req.body.chat_id) await telegramSendMessage(text, req.body.chat_id)

            res.header('Content-Type', 'text/xml');
            res.send(response)
        } else {
            res.sendStatus(400)
        }

    } else if (req.headers['content-type'] === 'application/json') {
        if (req.body.object.metadata.chat_id) await telegramSendMessage(req.body, req.body.object.metadata.chat_id)
        res.sendStatus(200)
    } else {
        console.log(req)
        res.sendStatus(200)
    }
})

app.listen(3001, () => console.log('OK, server started'))