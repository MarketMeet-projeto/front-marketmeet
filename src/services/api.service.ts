import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor() { }

  // ===== USER ENDPOINTS =====
  getCreateUserUrl(): string {
    return `${this.apiBaseUrl}/users/create`;
  }

  getLoginUrl(): string {
    return `${this.apiBaseUrl}/users/login`;
  }

  getUserUrl(userId: string): string {
    return `${this.apiBaseUrl}/users/${userId}`;
  }

  getUpdateUserUrl(): string {
    return `${this.apiBaseUrl}/users/update`;
  }

  getFollowUserUrl(userId: string): string {
    return `${this.apiBaseUrl}/users/${userId}/follow`;
  }

  getUnfollowUserUrl(userId: string): string {
    return `${this.apiBaseUrl}/users/${userId}/unfollow`;
  }

  // ===== POST ENDPOINTS =====
  getFeedUrl(page?: number, limit?: number): string {
    const params = new URLSearchParams();
    if (page !== undefined) params.append('page', page.toString());
    if (limit !== undefined) params.append('limit', limit.toString());
    return `${this.apiBaseUrl}/posts/feed${params.toString() ? '?' + params.toString() : ''}`;
  }

  getPostsUrl(page?: number, limit?: number): string {
    const params = new URLSearchParams();
    if (page !== undefined) params.append('page', page.toString());
    if (limit !== undefined) params.append('limit', limit.toString());
    return `${this.apiBaseUrl}/posts${params.toString() ? '?' + params.toString() : ''}`;
  }

  getPostUrl(postId: string): string {
    return `${this.apiBaseUrl}/posts/${postId}`;
  }

  getDeletePostUrl(postId: string): string {
    return `${this.apiBaseUrl}/posts/${postId}`;
  }

  getPostsByCategoryUrl(categoryId: string, page?: number, limit?: number): string {
    const params = new URLSearchParams();
    if (page !== undefined) params.append('page', page.toString());
    if (limit !== undefined) params.append('limit', limit.toString());
    return `${this.apiBaseUrl}/posts/category/${categoryId}${params.toString() ? '?' + params.toString() : ''}`;
  }

  getPostsByRatingUrl(minRating: number, page?: number, limit?: number): string {
    const params = new URLSearchParams();
    params.append('rating', minRating.toString());
    if (page !== undefined) params.append('page', page.toString());
    if (limit !== undefined) params.append('limit', limit.toString());
    return `${this.apiBaseUrl}/posts/rating${params.toString() ? '?' + params.toString() : ''}`;
  }

  // ===== LIKE ENDPOINTS =====
  getLikePostUrl(postId: string): string {
    return `${this.apiBaseUrl}/posts/${postId}/like`;
  }

  getUnlikePostUrl(postId: string): string {
    return `${this.apiBaseUrl}/posts/${postId}/unlike`;
  }

  getLikeStatusUrl(postId: string): string {
    return `${this.apiBaseUrl}/posts/${postId}/like-status`;
  }

  // ===== COMMENT ENDPOINTS =====
  getCommentsUrl(postId: string): string {
    return `${this.apiBaseUrl}/posts/${postId}/comments`;
  }

  getCommentUrl(postId: string, commentId: string): string {
    return `${this.apiBaseUrl}/posts/${postId}/comments/${commentId}`;
  }

  getAddCommentUrl(postId: string): string {
    return `${this.apiBaseUrl}/posts/${postId}/comments`;
  }

  getDeleteCommentUrl(postId: string, commentId: string): string {
    return `${this.apiBaseUrl}/posts/${postId}/comments/${commentId}`;
  }

  // ===== CATEGORY ENDPOINTS =====
  getCategoriesUrl(): string {
    return `${this.apiBaseUrl}/categories`;
  }

  getCategoryUrl(categoryId: string): string {
    return `${this.apiBaseUrl}/categories/${categoryId}`;
  }

  // ===== STATS ENDPOINTS =====
  getUserStatsUrl(userId: string): string {
    return `${this.apiBaseUrl}/stats/user/${userId}`;
  }

  getPostStatsUrl(postId: string): string {
    return `${this.apiBaseUrl}/stats/post/${postId}`;
  }

  // ===== BASE URL =====
  getBaseUrl(): string {
    return this.apiBaseUrl;
  }
}
