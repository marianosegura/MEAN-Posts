import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { mimeTypeValidator } from "./mime-type.validator";  // custom validator

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit, OnDestroy {
  inEditMode: boolean = false;
  post: Post;
  isLoading: boolean = false;
  errorSub: Subscription;

  postForm: FormGroup;
  imagePreviewUrl: string;

  constructor(
    private postsService: PostsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.postForm = new FormGroup({
      'title': new FormControl(null, { validators: [Validators.required, Validators.minLength(3)]}),
      'content': new FormControl(null, { validators: [Validators.required]}),
      'image': new FormControl(null, { validators: [Validators.required], asyncValidators: [mimeTypeValidator]})  // not sync to html input
    });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {  // handle param changes
      this.inEditMode = paramMap.has('postId');
      this.post = null;

      if (this.inEditMode) {
        this.isLoading = true;
        this.postsService.getPost(paramMap.get('postId'))
          .subscribe((post) => {
            this.isLoading = false;
            this.post = post;
            this.imagePreviewUrl = post.imagePath;

            this.postForm.setValue({ 
              title: post.title, 
              content: post.content, 
              image: post.imagePath
            });
          });
      } 
    });

    this.errorSub = this.postsService.error$.subscribe(() => this.isLoading = false);
  }

  onSubmit() {
    if (this.postForm.invalid) return;
    this.isLoading = true;
    const { title, content, image } = this.postForm.value;

    if (this.inEditMode) {
      this.postsService.updatePost(this.post.id, title, content, image);
    } else {
      this.postsService.addPost(title, content, image);
    }
    this.postForm.reset();  // clear
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];  // extract file
    this.postForm.patchValue({ image: file });  // a file object
    this.postForm.get('image').updateValueAndValidity();  // revalidate

    const reader = new FileReader();
    reader.onload = () => {  // runs on load file
      this.imagePreviewUrl =  reader.result as string;
    };
    reader.readAsDataURL(file);  // load file
  }

  ngOnDestroy() {
    this.errorSub.unsubscribe();
  }
}
