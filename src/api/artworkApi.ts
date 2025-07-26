import axios from "axios"
export async function fetchArtwork(page=1,limit=10){
    try {
        const respond = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${page}&limit=${limit}`);
        const result = respond.data;
        return result;
    } catch (err:any) {
        console.log(err.message)
    }
    
}
fetchArtwork();