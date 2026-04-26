import { io } from 'socket.io-client'
import { API_BASE } from '../config'

const socket = io(API_BASE, { autoConnect: false })

export default socket
