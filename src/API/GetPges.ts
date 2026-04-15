import type {  ApiResponsePagenation } from "@/types/API_Form";

interface Post{
    id: number;
    title: string;
    content: string;


}


// api/posts.ts
const fetchPosts = async (page: number, limit: number) => {
  const res = await fetch(`/api/posts?page=${page}&limit=${limit}`);
  const json :ApiResponsePagenation<Post[]> = await res.json();


  return {
    data: json.data,          
    totalPages: json.totalPages,
  };
};


export default fetchPosts;