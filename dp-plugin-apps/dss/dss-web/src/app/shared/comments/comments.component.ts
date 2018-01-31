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
import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {CommentService} from "../../services/comment.service";
import {Comment, CommentWithUser} from "../../models/comment";
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

  isRatingEnabled: boolean = false;
  objectType: string;
  objectId: string;
  commentWithUsers: CommentWithUser[]= [];
  fetchInProgress: boolean =true;
  newCommentText: string;
  fetchError: boolean= false;
  returnURl: string = '';
  offset:number = 0;
  size:number = 10;
  allCommentsLoaded: boolean = false;
  timer = null;
  newCommentsAvailable:boolean = false;
  @ViewChild('newComment') newCommentTextArea : ElementRef;
  @ViewChild('edge') edgeElement: ElementRef;

  ngOnInit() {
    this.objectType = this.route.snapshot.params['objectType'];
    this.objectId = this.route.parent.snapshot.params['id'];
    this.isRatingEnabled = this.route.snapshot.params['isRatingEnabled'];
    this.getComments(true);
    this.route.queryParams.subscribe((params) => {
      this.returnURl = params.returnURl;
    });
  }

  getComments(refreshScreen: boolean) {
    this.fetchError = false;
    this.fetchInProgress = refreshScreen;
    this.commentService.getByObjectRef(this.objectId,this.objectType,this.offset,this.size).subscribe(comments =>{
        this.commentWithUsers = this.offset === 0 ? comments : this.commentWithUsers.concat(comments);
        this.allCommentsLoaded = comments.length < this.size ? true : false;
        this.offset = this.offset + comments.length;
        this.fetchInProgress = false;
        setTimeout(() => {
          this.loadNext();       // required in case 'edge' is already in viewport (without scrolling). setTimeout is needed as window takes some time to adjust with newly loaded comments.
        },50);
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
      this.commentService.add(newCommentObject).subscribe(_ => {
        if(this.isEdgeInViewport()){
          this.getComments(false);
        }else{
          this.newCommentsAvailable = true;
        }
        this.newCommentText = "";
        this.resizeTextArea();
      });
    }
  }

  resetOffset(){
    this.offset =0;
    this.allCommentsLoaded = false;
  }
  onDeleteComment(commentWU: CommentWithUser) {
    this.commentService.deleteComment(commentWU.comment.id).subscribe(_ => {
      this.resetOffset();
      this.getComments(false);
    });
  }

  isLoggedInUser(commentWu: CommentWithUser){
    return Number(AuthUtils.getUser().id) === commentWu.comment.createdBy;
  }

  formatDate(dateString: string) {
    let date = moment(dateString);
    return date.format("hh:mm A MMM DD 'YY");
  }

  lengthAdjustedComment(comment: string, isExpanded: boolean) {
    if(!isExpanded){
      return comment.substring(0,128)+"...  ";
    }
    return comment+"  ";
  }

  resizeTextArea(){
    let textArea = this.newCommentTextArea.nativeElement;
    setTimeout(function() {
      textArea.style.cssText = 'height:auto';
      textArea.style.cssText = 'height:'+Math.min(textArea.scrollHeight, 100) + "px";
    },0);
  }

  isEdgeInViewport() {
    let element = this.edgeElement.nativeElement;
    let rect = element.getBoundingClientRect();
    let parentEle = this.edgeElement.nativeElement.parentElement;
    let parentRect = parentEle.getBoundingClientRect();
    return (
      rect.top < parentRect.bottom &&
      rect.bottom > 0
    );
  }

  shouldLoadNext(){
    return this.isEdgeInViewport() && (!this.allCommentsLoaded || this.newCommentsAvailable);
  }

  loadNext(){
    if(this.shouldLoadNext()){
      clearTimeout(this.timer);
      this.timer = null;
      this.timer = setTimeout(() => {
        this.getComments(false);
        this.newCommentsAvailable = false;
        this.timer = null;
      }, 1000);
    }
  }
}
