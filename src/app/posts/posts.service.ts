import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Post } from './post.module';

@Injectable({ providedIn: 'root' })

export class PostService {

    private posts: Post[] = [];
    private postsUpdates = new Subject<Post[]>();

    constructor(
        private http: HttpClient,
        private router: Router) { }


    // HTTP get verb: For retriving the list of posts from the server (backend).
    getPosts() {
        this.http.get<{ message: string, posts: any }>('http://localhost:3000/api/posts')
            .pipe(map((postData) => {
                return postData.posts.map(post => {
                    return {
                        title: post.title,
                        content: post.content,
                        id: post._id,
                        imagePath: post.imagePath
                    }
                });
            }))
            .subscribe((transformedPosts) => {
                this.posts = transformedPosts;
                this.postsUpdates.next([...this.posts]);
            });
    };


    // This is a observable method. that observers any update in the post.
    getPostUpdateListerner() {
        return this.postsUpdates.asObservable();
    };


    // HTTP get verb: For retriving a post based on id from the server (backend).
    getPost(id: string) {
        return this.http
            .get<{ _id: string, title: string, content: string, imagePath: string }>
            ("http://localhost:3000/api/posts/" + id);
    };


    // HTTP POST verb: Adding new post to the server (backend) as well as in the local post array and also update. 
    addPost(title: string, content: string, image: File) {
        // const post: Post = { id: null, title: title, content: content };
        const postDate = new FormData();
        postDate.append("title", title);
        postDate.append("content", content);
        postDate.append("image", image, title);
        this.http.post<{ message: string, post: Post }>('http://localhost:3000/api/posts', postDate)
            .subscribe((responseData) => {
                const post: Post = { id: responseData.post.id, title: title, content: content, imagePath: responseData.post.imagePath };
                this.posts.push(post);
                this.postsUpdates.next([...this.posts]);
                this.router.navigate(["/"]);
            });
    };


    // HTTP DELETE verb: Deleting post from the server(backend)
    deletePost(postId: string) {
        this.http.delete("http://localhost:3000/api/posts/" + postId)
            .subscribe(() => {
                console.log('Deleted!');
                const updatedPosts = this.posts.filter(post => post.id !== postId);
                this.posts = updatedPosts;
                this.postsUpdates.next([...this.posts]);
            });
    };


    // HTTP PUT verb:
    updatePost(id: string, title: string, content: string, image: File | string) {
        let postData: Post | FormData;
        if (typeof (image) === 'object') {
            postData = new FormData();
            postData.append("id", id);
            postData.append("title", title);
            postData.append("content", content);
            postData.append("image", image, title)
        } else {
            postData = { id: id, title: title, content: content, imagePath: image }
        }
        this.http.put("http://localhost:3000/api/posts/" + id, postData)
            .subscribe(response => {
                const updatedPosts = [...this.posts];
                const oldPostIndex = updatedPosts.findIndex(p => p.id === id);
                const post: Post = { id: id, title: title, content: content, imagePath: "" };
                updatedPosts[oldPostIndex] = post;
                this.posts = updatedPosts;
                this.postsUpdates.next([...this.posts]);
                this.router.navigate(["/"]);
            });
    };

}