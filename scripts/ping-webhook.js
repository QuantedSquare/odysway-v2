import axios from 'axios'

const WEBHOOK_URL = 'http://localhost:3000/api/v1/webhooks/booking/cronjob' // Change this to your actual endpoint

async function pingWebhook() {
  try {
    const response = await axios.get(WEBHOOK_URL)
    console.log('Webhook pinged successfully:', response.data)
  }
  catch (error) {
    console.error('Error pinging webhook:', error.response ? error.response.data : error.message)
  }
}

pingWebhook()
