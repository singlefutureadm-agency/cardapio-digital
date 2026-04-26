import axios from "axios";

const api = axios.create({
  baseURL: "https://cardapio-digital-2k1u.onrender.com"
});

export default api;