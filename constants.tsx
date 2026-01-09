
import { User, Post, Faith } from './types';

export const FAITH_OPTIONS: Faith[] = ['Christianity', 'Islam', 'Judaism', 'Other'];

export const MOCK_LEADERS: User[] = [
  {
    id: 'l1',
    name: 'Pastor John Mark',
    email: 'john@faith.com',
    role: 'leader',
    faith: 'Christianity',
    bio: 'Spreading the gospel of love and hope for over 20 years.',
    profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
    followers: ['u1', 'u2', 'l2', 'l3'],
    following: ['l2', 'l4'],
    savedPosts: [],
    onlineStatus: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'l2',
    name: 'Imam Ahmad',
    email: 'ahmad@faith.com',
    role: 'leader',
    faith: 'Islam',
    bio: 'Dedicated to community building and spiritual guidance.',
    profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    followers: ['u3', 'l1'],
    following: ['l1', 'l5'],
    savedPosts: [],
    onlineStatus: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'l3',
    name: 'Rabbi Sarah Cohen',
    email: 'sarah@faith.com',
    role: 'leader',
    faith: 'Judaism',
    bio: 'Exploring the wisdom of the Torah in modern life.',
    profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    followers: ['u4', 'l1'],
    following: ['l1', 'l4'],
    savedPosts: [],
    onlineStatus: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'l4',
    name: 'Sister Mary Teresa',
    email: 'mary@faith.com',
    role: 'leader',
    faith: 'Christianity',
    bio: 'A voice for the voiceless through prayer and action.',
    profilePhoto: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=400&h=400&fit=crop',
    followers: ['u1', 'u4', 'l3'],
    following: ['l3'],
    savedPosts: [],
    onlineStatus: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'l5',
    name: 'Sheikh Omar',
    email: 'omar@faith.com',
    role: 'leader',
    faith: 'Islam',
    bio: 'Wisdom for the youth. Bridging gaps between faith and science.',
    profilePhoto: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop',
    followers: ['l2'],
    following: ['l2'],
    savedPosts: [],
    onlineStatus: false,
    createdAt: new Date().toISOString()
  }
];

export const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    authorId: 'l1',
    authorName: 'Pastor John Mark',
    authorPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
    type: 'post',
    content: 'Grace is not just a favor, it is the power to overcome obstacles that seem insurmountable.',
    media: 'https://images.unsplash.com/photo-1499209974431-9dac3adaf471?w=800',
    likes: ['u1', 'u2', 'l2'],
    saves: ['u1'],
    comments: [
      { id: 'c_init1', userId: 'u1', userName: 'Faithful Soul', text: 'This changed my morning. Thank you!', createdAt: new Date().toISOString() }
    ],
    shares: 12,
    views: 120,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'p2',
    authorId: 'l2',
    authorName: 'Imam Ahmad',
    authorPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    type: 'reel',
    content: 'Friday Jumuah reflections. May peace be upon you all. #Faith #Community #Peace',
    media: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    likes: ['u3', 'l1'],
    saves: ['l1'],
    comments: [{ id: 'c1', userId: 'u1', userName: 'Worshiper 1', text: 'Beautiful reminder!', createdAt: new Date().toISOString() }],
    shares: 5,
    views: 500,
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'p3',
    authorId: 'l3',
    authorName: 'Rabbi Sarah Cohen',
    authorPhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    type: 'post',
    content: 'Shabbat Shalom everyone. May your rest be restorative and your heart light.',
    media: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800',
    likes: ['u4', 'l4'],
    saves: ['u4'],
    comments: [],
    shares: 8,
    views: 95,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];
