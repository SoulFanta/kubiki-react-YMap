import axios from "axios";

const API = "https://localhost:7060/api"

export const api = axios.create({ baseURL: API})