
import { User, Post, Message, Notification, Faith } from '../types';
import { MOCK_LEADERS, MOCK_POSTS } from '../constants';

const STORAGE_KEY = 'faith_connect_pro_v3';

class MockApiService {
  private data: {
    users: User[];
    posts: Post[];
    messages: Message[];
    notifications: Notification[];
    currentUser: User | null;
  };

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      this.data = JSON.parse(saved);
    } else {
      this.data = {
        users: [...MOCK_LEADERS],
        posts: [...MOCK_POSTS],
        messages: [
          { id: 'm1', senderId: 'l1', receiverId: 'u1', text: 'Peace be with you. How can I guide you today?', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
          { id: 'm2', senderId: 'l2', receiverId: 'u1', text: 'Thank you for following our Friday reflections.', read: true, createdAt: new Date(Date.now() - 3600000).toISOString() }
        ],
        notifications: [],
        currentUser: null
      };
      this.save();
    }
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  // Auth
  async login(email: string, role: 'worshiper' | 'leader') {
    await new Promise(r => setTimeout(r, 800));
    let user = this.data.users.find(u => u.email === email);
    if (!user) {
      user = {
        id: 'u' + Math.random().toString(36).substr(2, 9),
        name: email.split('@')[0],
        email,
        role,
        faith: 'Other',
        profilePhoto: `https://picsum.photos/seed/${email}/400`,
        followers: [],
        following: [],
        savedPosts: [],
        onlineStatus: true,
        createdAt: new Date().toISOString()
      };
      this.data.users.push(user);
    }
    this.data.currentUser = user;
    this.save();
    return user;
  }

  logout() {
    this.data.currentUser = null;
    this.save();
  }

  getCurrentUser() {
    return this.data.currentUser;
  }

  // Users
  async getLeaders(search: string = '', faith: string = '') {
    const term = search.toLowerCase().trim();
    return this.data.users.filter(u => 
      u.role === 'leader' &&
      (term === '' || u.name.toLowerCase().includes(term) || u.faith.toLowerCase().includes(term)) &&
      (faith === '' || u.faith === faith)
    );
  }

  async getFollowers(userId: string) {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return [];
    return this.data.users.filter(u => user.followers.includes(u.id));
  }

  async getFollowing(userId: string) {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return [];
    return this.data.users.filter(u => user.following.includes(u.id));
  }

  async followUser(targetId: string) {
    if (!this.data.currentUser) return;
    if (!this.data.currentUser.following.includes(targetId)) {
      this.data.currentUser.following.push(targetId);
      const target = this.data.users.find(u => u.id === targetId);
      if (target) target.followers.push(this.data.currentUser.id);
      this.data.notifications.unshift({
        id: Math.random().toString(),
        userId: targetId,
        type: 'follow',
        fromId: this.data.currentUser.id,
        fromName: this.data.currentUser.name,
        read: false,
        createdAt: new Date().toISOString()
      });
      this.save();
    }
  }

  async unfollowUser(targetId: string) {
    if (!this.data.currentUser) return;
    this.data.currentUser.following = this.data.currentUser.following.filter(id => id !== targetId);
    const target = this.data.users.find(u => u.id === targetId);
    if (target) target.followers = target.followers.filter(id => id !== this.data.currentUser!.id);
    this.save();
  }

  // Posts
  async getExplorePosts() {
    return this.data.posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getPostsByUser(userId: string) {
    return this.data.posts.filter(p => p.authorId === userId);
  }

  async getSavedPosts() {
    if (!this.data.currentUser) return [];
    return this.data.posts.filter(p => this.data.currentUser?.savedPosts.includes(p.id));
  }

  async likePost(postId: string) {
    if (!this.data.currentUser) return;
    const post = this.data.posts.find(p => p.id === postId);
    if (!post) return;
    const idx = post.likes.indexOf(this.data.currentUser.id);
    if (idx === -1) post.likes.push(this.data.currentUser.id);
    else post.likes.splice(idx, 1);
    this.save();
  }

  async savePost(postId: string) {
    if (!this.data.currentUser) return;
    const idx = this.data.currentUser.savedPosts.indexOf(postId);
    if (idx === -1) this.data.currentUser.savedPosts.push(postId);
    else this.data.currentUser.savedPosts.splice(idx, 1);
    this.save();
  }

  // Messages
  async getConversations() {
    if (!this.data.currentUser) return [];
    const myId = this.data.currentUser.id;
    const convos = new Map<string, { user: User, lastMessage: Message }>();
    this.data.messages.forEach(m => {
      const otherId = m.senderId === myId ? m.receiverId : m.senderId;
      if (m.senderId === myId || m.receiverId === myId) {
        const otherUser = this.data.users.find(u => u.id === otherId);
        if (otherUser) convos.set(otherId, { user: otherUser, lastMessage: m });
      }
    });
    return Array.from(convos.values());
  }

  async getMessages(otherId: string) {
    if (!this.data.currentUser) return [];
    const myId = this.data.currentUser.id;
    return this.data.messages.filter(m => (m.senderId === myId && m.receiverId === otherId) || (m.senderId === otherId && m.receiverId === myId));
  }

  async sendMessage(receiverId: string, text: string) {
    if (!this.data.currentUser) return;
    const msg: Message = { id: Math.random().toString(), senderId: this.data.currentUser.id, receiverId, text, read: false, createdAt: new Date().toISOString() };
    this.data.messages.push(msg);
    this.save();
    return msg;
  }

  async getNotifications() {
    if (!this.data.currentUser) return [];
    return this.data.notifications.filter(n => n.userId === this.data.currentUser?.id);
  }
}

export const api = new MockApiService();
