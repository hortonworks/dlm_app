/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */
import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {CommentService} from "../../services/comment.service";
import {CommentWithUserAndChildren, Comment, CommentWithUser, ReplyParent} from "../../models/comment";
import {AuthUtils} from "../utils/auth-utils";
import * as moment from 'moment';
import {RatingService} from "../../services/rating.service";
import {Rating} from "../../models/rating";

@Component({
  selector: 'dp-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {

  constructor(private router: Router,
              private route: ActivatedRoute,
              private translateService: TranslateService,
              private commentService: CommentService,
              private ratingService: RatingService) { }

  isRatingEnabled: boolean = false;
  objectType: string;
  objectId: string;
  commentsWithUserAndChildren: CommentWithUserAndChildren[]= [];
  fetchInProgress: boolean =true;
  newCommentText: string;
  isReply: boolean = false;
  reply: ReplyParent;
  fetchError: boolean= false;
  returnURl: string = '';
  totalVotes: number = 0;
  userRating: Rating = new Rating();
  averageRating: number =0;
  userRatingLabel: string = "";

  ngOnInit() {
    this.objectType = this.route.snapshot.params['objectType'];
    this.objectId = this.route.parent.snapshot.params['id'];
    this.isRatingEnabled = this.route.snapshot.params['isRatingEnabled'];
    this.userRating.rating =0;
    this.getRating();
    this.getComments(true);
    this.route.queryParams.subscribe((params) => {
      this.returnURl = params.returnURl;
    });
  }

  getRating(){
    this.ratingService.get(this.objectId,this.objectType).subscribe( rating => {
      this.userRating = rating;
      this.userRatingLabel = "YOU RATED"
    }, err => {
      if(err.status == 404){
        this.userRating = new Rating();
        this.userRating.rating = 0;
        this.userRatingLabel = "RATE THIS COLLECTION"
      }
    });
    this.getAverageRating();
  }
  getAverageRating(){
    this.ratingService.getAverage(this.objectId,this.objectType).subscribe( averageAndVotes => {
      this.totalVotes = averageAndVotes.votes;
      this.averageRating = averageAndVotes.average;
    });
  }

  onRatingChange(event){
    if(this.userRating.rating === 0){
      let newRating = new Rating();
      newRating.rating = event.rating;
      newRating.createdBy = Number(AuthUtils.getUser().id);
      newRating.objectId = Number(this.objectId);
      newRating.objectType = this.objectType;
      this.ratingService.add(newRating).subscribe(rating => {
        this.userRating = rating;
        this.getAverageRating();
      })
    }else {
      this.ratingService.update(event.rating, this.userRating.id).subscribe(rating => {
        this.userRating = rating;
        this.getAverageRating();
      });
    }
  }

  onHoverRatingChange(){
    this.userRatingLabel = "RATE THIS COLLECTION";
  }

  onMouseLeave(){
    if(this.userRating.rating !== 0){
      this.userRatingLabel = "YOU RATED";
    }
  }

  formatTotalVotes(totalVotes){
    if(totalVotes === 1 || totalVotes === 0){
      return totalVotes+" vote";
    }
    return totalVotes+ " votes";
  }
  getComments(refreshScreen: boolean) {
    this.fetchError = false;
    this.fetchInProgress = refreshScreen;
    this.commentService.getByObjectRef(this.objectId,this.objectType).subscribe(comments =>{
        this.commentsWithUserAndChildren = comments;
        this.fetchInProgress = false;
      }, () => {
        this.fetchInProgress = false;
        this.fetchError = true;
      }
    );
  }

  onPostComment() {
    if(this.newCommentText && this.newCommentText.trim()){
      let newCommentObject = new Comment();
      newCommentObject.objectType = this.objectType;
      newCommentObject.objectId = Number(this.objectId);
      newCommentObject.comment = this.newCommentText;
      newCommentObject.createdBy = Number(AuthUtils.getUser().id);
      if(this.isReply) newCommentObject.parentCommentId = this.reply.parentId;
      this.commentService.add(newCommentObject).subscribe(_ => {
        this.getComments(false);
        this.newCommentText = "";
        this.removeReply();
      });
    }
  }

  onDeleteComment(commentWU: CommentWithUser) {
    this.commentService.deleteComment(commentWU.comment.id).subscribe(_ => {
      this.getComments(false);
    });
  }

  onReplyToComment(parentCommentWU: CommentWithUser){
     this.reply = new ReplyParent();
     let parentComment = parentCommentWU.comment;
     if(parentComment.parentCommentId){
       this.reply.parentId = parentComment.parentCommentId;
     }else{
       this.reply.parentId = parentComment.id;
     }
     this.reply.commentText = parentComment.comment;
     this.reply.username = parentCommentWU.userName;
     this.isReply = true;
  }

  removeReply(){
    this.reply = new ReplyParent();
    this.isReply = false;
  }

  isLoggedInUser(commentWu: CommentWithUser){
    return Number(AuthUtils.getUser().id) === commentWu.comment.createdBy;
  }

  formatDate(dateString: string) {
    let date = moment(dateString);
    return date.format("hh:mm A MMM DD 'YY");
  }

}
