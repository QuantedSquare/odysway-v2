import axios from 'axios'

const { data } = await axios.get('http://localhost:3000/api/v1/booking?slug=test')

console.log(data)
