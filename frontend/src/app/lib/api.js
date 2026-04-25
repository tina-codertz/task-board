const API_URL = import.meta.env.VITE_API_URL

// all apis from the backend are called in this page and the auth headers is injected automaticlly
//the public endpoints login/register skip the token by pasing {public:true}

const request = async(method)