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
import {OneLevelComment, Comment, CommentWithUser, ReplyParent} from "../../models/comment";
import {AuthUtils} from "../utils/auth-utils";
import * as moment from 'moment';

@Component({
  selector: 'dp-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {

  constructor(private router: Router,
              private route: ActivatedRoute,
              private translateService: TranslateService,
              private commentService: CommentService) { }

  objectType: string;
  objectId: string;
  oneLevelComments: OneLevelComment[]= [];
  fetchInProgress: boolean =true;
  newCommentText: string;
  isReply: boolean = false;
  reply: ReplyParent;
  fetchError: boolean= false;

  ngOnInit() {
    this.objectType = this.route.snapshot.params['objectType'];
    this.objectId = this.route.parent.snapshot.params['id'];
    this.getComments(true);
  }

  getComments(refreshScreen: boolean) {
    let that = this;
    this.fetchError = false;
    this.fetchInProgress = refreshScreen;
    this.commentService.getByObjectRef(this.objectId,this.objectType).subscribe(comments =>{
        that.oneLevelComments = comments;
        that.fetchInProgress = false;
      }, () => {
        that.fetchInProgress = false;
        that.fetchError = true;
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
    this.commentService.deleteComment(commentWU.comment.id, commentWU.comment.createdBy).subscribe(_ => {
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
