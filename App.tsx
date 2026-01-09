
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, Post, Message, Faith, UserRole, Comment, Notification } from './types';
import { api } from './services/mockApi';
import { FAITH_OPTIONS, MOCK_LEADERS, MOCK_POSTS } from './constants';
import { 
  Home, Users, PlayCircle, MessageSquare, User as UserIcon, Search, Bell, Plus,
  LogOut, ChevronLeft, Heart, MessageCircle, Bookmark, Send, MoreHorizontal,
  X, Sparkles, ChevronRight, Share2, Award, Filter, Mail, Lock, 
  User as UserInputIcon, Eye, EyeOff, Globe, ArrowRight, TrendingUp, 
  ShieldCheck, VolumeX, Volume2, CheckCircle2, MoreVertical, 
  Image as ImageIcon, Smile, MapPin, Copy, Check, Hash, Activity, Loader2
} from 'lucide-react';

// --- Global Utilities ---

const Spinner = ({ text = "Blessing your feed..." }) => (
  <div className="flex flex-col items-center justify-center p-12 space-y-4">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 border-2 border-blue-50 rounded-full"></div>
      <div className="absolute inset-0 border-2 border-[#007BFF] border-t-transparent rounded-full animate-spin"></div>
    </div>
    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[2px] text-center">{text}</p>
  </div>
);

const FaithAvatar = ({ user, size = "md", hasRing = true, ringActive = true, isStory = false, onClick }: any) => {
  const getFaithColor = (faith: Faith) => {
    switch(faith) {
      case 'Christianity': return 'from-blue-400 via-blue-500 to-indigo-600';
      case 'Islam': return 'from-emerald-400 via-green-500 to-teal-600';
      case 'Judaism': return 'from-amber-400 via-orange-500 to-red-600';
      default: return 'from-purple-400 via-pink-500 to-blue-600';
    }
  };

  const sizes = {
    sm: 'w-8 h-8 rounded-full',
    md: 'w-16 h-16 rounded-full',
    lg: 'w-20 h-20 rounded-full',
    xl: 'w-24 h-24 rounded-full'
  };
  
  return (
    <div onClick={onClick} className={`relative inline-block transition-transform active:scale-90 cursor-pointer`}>
      {hasRing && (
        <div className={`absolute -inset-[3px] bg-gradient-to-tr ${ringActive ? getFaithColor(user.faith) : 'from-gray-100 to-gray-200'} rounded-full p-[2px]`}>
          <div className="w-full h-full bg-white rounded-full"></div>
        </div>
      )}
      <div className={`${sizes[size as keyof typeof sizes]} relative overflow-hidden p-[1.5px] bg-white rounded-full z-10 shadow-sm border border-gray-100`}>
        <img src={user.profilePhoto} className="w-full h-full object-cover rounded-full" alt={user.name} />
      </div>
      {user.onlineStatus && !isStory && (
        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full z-20"></div>
      )}
    </div>
  );
};

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = "button" }: any) => {
  const base = "px-6 py-4 rounded-2xl font-black transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-2 text-sm uppercase tracking-widest";
  const styles = {
    primary: "bg-[#007BFF] text-white shadow-lg shadow-blue-200 hover:brightness-110",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    outline: "border-2 border-gray-100 text-gray-700 hover:bg-gray-50",
    ghost: "bg-transparent text-gray-500 hover:text-gray-800"
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${styles[variant as keyof typeof styles]} ${className}`}>
      {children}
    </button>
  );
};

// --- MODALS & OVERLAYS ---

const UserListModal = ({ title, users, onClose, onSelectUser }: any) => {
  return (
    <div className="fixed inset-0 bg-black/60 z-[3000] flex flex-col justify-end">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="bg-white rounded-t-[3rem] h-[75vh] flex flex-col relative z-10 animate-slideUp overflow-hidden">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-4 mb-2"></div>
        <header className="px-8 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-black text-sm uppercase tracking-widest text-gray-400">{title}</h3>
          <button onClick={onClose} className="p-2 text-gray-400"><X size={24} /></button>
        </header>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
          {users.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-20">
              <Users size={64} className="mb-4" />
              <p className="text-sm font-black uppercase tracking-widest">No users found on this list.</p>
            </div>
          ) : users.map((u: User) => (
            <div 
              key={u.id} 
              onClick={() => onSelectUser(u)}
              className="flex items-center p-3 rounded-2xl hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer"
            >
              <FaithAvatar user={u} size="sm" hasRing={false} />
              <div className="ml-4 flex-1">
                <h4 className="text-sm font-black text-gray-900 flex items-center">
                  {u.name} 
                  {u.role === 'leader' && <CheckCircle2 size={12} className="ml-1 text-[#007BFF]" />}
                </h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{u.faith}</p>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ShareModal = ({ post, onClose }: any) => {
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [sentTo, setSentTo] = useState<string[]>([]);
  const currentUser = api.getCurrentUser();
  const connections = MOCK_LEADERS.filter(l => currentUser?.following.includes(l.id));

  const filtered = connections.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleSendInternal = (userId: string) => {
    if (sentTo.includes(userId)) return;
    setSentTo([...sentTo, userId]);
    api.sendMessage(userId, `Shared a post from ${post.authorName}: ${post.content.substring(0, 30)}...`);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://faithconnect.app/post/${post.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSystemShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `FaithConnect: Word from ${post.authorName}`,
          text: post.content,
          url: window.location.href,
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[2500] flex flex-col justify-end">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="bg-white rounded-t-[3rem] h-[75vh] flex flex-col relative z-10 animate-slideUp overflow-hidden">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-4 mb-2"></div>
        
        <div className="px-8 pt-6 pb-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#007BFF]" size={18} />
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search for guides or seekers..." 
              className="w-full bg-gray-50 border-none rounded-[1.5rem] pl-12 pr-6 py-4 text-sm font-bold outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-2 no-scrollbar space-y-4">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Sacred Connections</h4>
          {filtered.length === 0 ? (
            <p className="text-xs text-gray-300 py-10 text-center font-bold italic">No connections found in this sanctuary.</p>
          ) : filtered.map(user => (
            <div key={user.id} className="flex items-center justify-between p-2 rounded-2xl hover:bg-gray-50 transition-all">
              <div className="flex items-center space-x-4">
                <FaithAvatar user={user} size="sm" hasRing={false} />
                <div>
                  <h5 className="text-xs font-black text-gray-900">{user.name}</h5>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{user.faith}</p>
                </div>
              </div>
              <button 
                onClick={() => handleSendInternal(user.id)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sentTo.includes(user.id) ? 'bg-gray-100 text-gray-400' : 'bg-[#007BFF] text-white shadow-md shadow-blue-100'}`}
              >
                {sentTo.includes(user.id) ? 'Sent' : 'Send'}
              </button>
            </div>
          ))}
        </div>

        <div className="p-8 bg-white border-t border-gray-50 flex items-center justify-around pb-12">
          <button onClick={handleCopyLink} className="flex flex-col items-center space-y-2 group">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${copied ? 'bg-green-50 text-green-500' : 'bg-gray-50 text-gray-900 group-hover:bg-gray-100'}`}>
              {copied ? <Check size={24} /> : <Copy size={24} />}
            </div>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{copied ? 'Copied' : 'Link'}</span>
          </button>
          
          <button onClick={handleSystemShare} className="flex flex-col items-center space-y-2 group">
            <div className="w-14 h-14 bg-gray-50 text-gray-900 rounded-2xl flex items-center justify-center group-hover:bg-gray-100 transition-all">
              <Share2 size={24} />
            </div>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">More</span>
          </button>

          <button onClick={onClose} className="flex flex-col items-center space-y-2 group">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center group-hover:bg-red-100 transition-all">
              <X size={24} />
            </div>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const CommentModal = ({ post, onClose, onRefresh }: any) => {
  const [text, setText] = useState('');
  const currentUser = api.getCurrentUser();

  const handleSend = async () => {
    if (!text.trim()) return;
    post.comments.push({
      id: Math.random().toString(),
      userId: currentUser!.id,
      userName: currentUser!.name,
      text: text,
      createdAt: new Date().toISOString()
    });
    setText('');
    onRefresh();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[2000] flex flex-col justify-end">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="bg-white rounded-t-[3rem] h-[85vh] flex flex-col relative z-10 animate-slideUp overflow-hidden">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-4 mb-2"></div>
        <header className="px-8 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-black text-sm uppercase tracking-widest text-gray-400">Reflections ({post.comments.length})</h3>
          <button onClick={onClose} className="p-2 text-gray-400"><X size={24} /></button>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
          {post.comments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-20">
              <MessageCircle size={64} />
              <p className="text-sm font-black uppercase tracking-widest">No reflections yet.<br/>Be the first to speak.</p>
            </div>
          ) : post.comments.map((c: any) => (
            <div key={c.id} className="flex space-x-4 animate-messageIn">
              <div className="w-10 h-10 rounded-2xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                <img src={`https://picsum.photos/seed/${c.userId}/100`} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-gray-900">{c.userName}</h4>
                  <span className="text-[9px] font-black text-gray-300 uppercase">{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{c.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-white border-t border-gray-50 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 shrink-0 overflow-hidden border border-gray-100 p-0.5">
            <img src={currentUser?.profilePhoto} className="w-full h-full object-cover rounded-[0.8rem]" />
          </div>
          <div className="flex-1 relative">
            <input 
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={`Share a word with ${post.authorName}...`} 
              className="w-full bg-gray-50 border-none rounded-[1.5rem] px-6 py-4 text-sm font-medium outline-none pr-12"
            />
            <button 
              onClick={handleSend}
              className={`absolute right-4 top-1/2 -translate-y-1/2 font-black text-xs uppercase tracking-widest transition-colors ${text.trim() ? 'text-[#007BFF]' : 'text-gray-300'}`}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- AUTHENTICATION ---

const AuthScreen = ({ mode, setMode, onAuth, defaultRole = 'worshiper' }: any) => {
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [faith, setFaith] = useState<Faith>('Other');
  const [loading, setLoading] = useState(false);
  const isLogin = mode === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onAuth(email, role);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-white flex flex-col animate-slideInRight z-[1000] overflow-hidden">
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-50 bg-white sticky top-0 z-[1050]">
        <button onClick={() => setMode('landing')} className="p-2 -ml-2 text-gray-400 hover:text-gray-900"><ChevronLeft size={28} /></button>
        <div className="flex bg-gray-100 p-1 rounded-2xl w-48">
          <button type="button" onClick={() => setMode('login')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-white text-[#007BFF] shadow-sm' : 'text-gray-400'}`}>Sign In</button>
          <button type="button" onClick={() => setMode('signup')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-white text-[#007BFF] shadow-sm' : 'text-gray-400'}`}>Join</button>
        </div>
        <div className="w-10"></div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar px-8 py-10 space-y-12">
        <div className="space-y-3">
          <div className="w-12 h-1.5 bg-[#007BFF] rounded-full"></div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter leading-tight">{isLogin ? 'Peace Be\nUpon You.' : 'Create Your\nSanctuary.'}</h2>
          <p className="text-gray-400 font-medium text-sm leading-relaxed max-w-[280px]">{isLogin ? 'Step into the circle of faith.' : 'Find your guide and grow your soul.'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 pb-10">
          <div className="grid grid-cols-2 gap-4">
            {(['worshiper', 'leader'] as UserRole[]).map(r => (
              <button key={r} type="button" onClick={() => setRole(r)} className={`flex flex-col items-center py-6 px-4 rounded-[2.5rem] border-2 transition-all ${role === r ? 'border-[#007BFF] bg-blue-50/30' : 'border-gray-50 bg-gray-50'}`}>
                <div className={`p-4 rounded-full mb-3 ${role === r ? 'bg-[#007BFF] text-white shadow-lg' : 'bg-white text-gray-300'}`}>{r === 'worshiper' ? <Search size={22} /> : <Award size={22} />}</div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${role === r ? 'text-[#007BFF]' : 'text-gray-400'}`}>{r === 'worshiper' ? 'Seeker' : 'Guide'}</span>
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {!isLogin && (
              <>
                <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Full Name</label><input required value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-[#007BFF]/20 transition-all outline-none" /></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Sacred Path</label><select value={faith} onChange={e => setFaith(e.target.value as Faith)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none appearance-none">{FAITH_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}</select></div>
              </>
            )}
            <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Email</label><input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@sanctuary.com" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-[#007BFF]/20 transition-all outline-none" /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Password</label><input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-[#007BFF]/20 transition-all outline-none" /></div>
          </div>

          <Button type="submit" className="w-full h-16 group" disabled={loading}>
            {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><span>{isLogin ? 'Enter' : 'Join Path'}</span><ArrowRight size={20}/></>}
          </Button>
        </form>
      </div>
    </div>
  );
};

// --- CHAT MODULE ---

const ChatInbox = ({ onOpenRoom }: any) => {
  const [convos, setConvos] = useState<any[]>([]);
  useEffect(() => { api.getConversations().then(setConvos); }, []);

  return (
    <div className="flex-1 flex flex-col bg-white">
      <header className="px-8 py-6 space-y-2">
        <h2 className="text-3xl font-black tracking-tighter">Messages</h2>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Sacred Conversations</p>
      </header>
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 space-y-2">
        {convos.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 py-20 text-center space-y-4">
            <MessageSquare size={64} />
            <p className="text-sm font-black uppercase tracking-widest px-10">Connect with a guide to start a conversation.</p>
          </div>
        ) : convos.map(c => (
          <div key={c.user.id} onClick={() => onOpenRoom(c.user)} className="flex items-center p-4 rounded-[2rem] hover:bg-gray-50 transition-all cursor-pointer group active:scale-[0.98]">
            <FaithAvatar user={c.user} size="md" hasRing={true} ringActive={c.user.onlineStatus} />
            <div className="ml-5 flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <h4 className="text-sm font-black text-gray-900 truncate">{c.user.name}</h4>
                <span className="text-[9px] font-black text-gray-300 uppercase shrink-0">Now</span>
              </div>
              <p className="text-xs text-gray-400 truncate font-medium">{c.lastMessage.text}</p>
            </div>
            {c.lastMessage.read === false && <div className="ml-4 w-2 h-2 bg-[#007BFF] rounded-full shrink-0"></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

const ChatRoom = ({ otherUser, onBack }: any) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getMessages(otherUser.id).then(setMessages);
  }, [otherUser.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;
    const msg = await api.sendMessage(otherUser.id, text);
    if (msg) setMessages([...messages, msg]);
    setText('');
  };

  return (
    <div className="fixed inset-0 bg-white z-[1200] flex flex-col animate-slideInRight">
      <header className="px-6 py-5 border-b border-gray-50 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xl z-20">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 -ml-2 text-gray-400"><ChevronLeft size={28} /></button>
          <div className="flex items-center space-x-3">
            <FaithAvatar user={otherUser} size="sm" hasRing={false} />
            <div>
              <h3 className="text-sm font-black text-gray-900 flex items-center">{otherUser.name} <CheckCircle2 size={12} className="ml-1 text-[#007BFF]" /></h3>
              <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{otherUser.onlineStatus ? 'Online' : 'Resting'}</p>
            </div>
          </div>
        </div>
        <button className="p-2 text-gray-400"><MoreVertical size={20} /></button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 bg-gray-50/30">
        {messages.map((m, idx) => {
          const isMe = m.senderId === api.getCurrentUser()?.id;
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-messageIn`} style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className={`max-w-[80%] px-6 py-4 rounded-[1.8rem] text-sm font-medium shadow-sm leading-relaxed ${isMe ? 'bg-[#007BFF] text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}`}>
                {m.text}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-6 bg-white border-t border-gray-50 flex items-center space-x-4 pb-10">
        <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl"><Plus size={20} /></button>
        <div className="flex-1 relative">
          <input 
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..." 
            className="w-full bg-gray-50 border-none rounded-[1.5rem] px-6 py-4 text-sm font-medium outline-none pr-12"
          />
          <button onClick={handleSend} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#007BFF] active:scale-90 transition-all"><Send size={20} /></button>
        </div>
      </div>
    </div>
  );
};

// --- HOME FEED COMPONENTS ---

const StoryBar = ({ leaders, onOpenStory }: any) => (
  <div className="flex items-center space-x-6 overflow-x-auto no-scrollbar px-6 py-6 bg-white">
    <div className="flex flex-col items-center space-y-2 shrink-0 group">
      <div className="relative w-16 h-16 rounded-[1.8rem] bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-200 text-gray-300 group-hover:border-[#007BFF] group-hover:text-[#007BFF] transition-all cursor-pointer">
        <Plus size={24} />
      </div>
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Post</span>
    </div>
    {leaders.map((l: any) => (
      <div key={l.id} onClick={() => onOpenStory(l)} className="flex flex-col items-center space-y-2 shrink-0">
        <FaithAvatar user={l} size="md" hasRing={true} ringActive={l.onlineStatus} />
        <span className="text-[10px] font-black text-gray-900 truncate w-16 text-center tracking-tight">{l.name.split(' ')[0]}</span>
      </div>
    ))}
  </div>
);

const PostCard = ({ post, onOpenPost, onOpenLeader, onRefresh, onShare, onComment }: any) => {
  const currentUser = api.getCurrentUser();
  const [liked, setLiked] = useState(post.likes.includes(currentUser?.id || ''));
  const [animateHeart, setAnimateHeart] = useState(false);

  const handleLike = async () => {
    await api.likePost(post.id);
    setLiked(!liked);
    if (!liked) { setAnimateHeart(true); setTimeout(() => setAnimateHeart(false), 800); }
    onRefresh();
  };

  return (
    <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-50 transition-all active:scale-[0.99] group mb-8">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onOpenLeader(MOCK_LEADERS.find(l => l.id === post.authorId))}>
          <FaithAvatar user={MOCK_LEADERS.find(l => l.id === post.authorId) || MOCK_LEADERS[0]} size="sm" hasRing={false} />
          <div>
            <h4 className="text-xs font-black text-gray-900 flex items-center">{post.authorName} <CheckCircle2 size={12} className="ml-1 text-[#007BFF]" /></h4>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Verified Guide • {new Date(post.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <button className="text-gray-300 hover:text-gray-900 p-2"><MoreHorizontal size={20} /></button>
      </div>

      <div className="relative aspect-square overflow-hidden bg-gray-50" onDoubleClick={handleLike}>
        {post.type === 'reel' ? (
          <div className="w-full h-full relative">
            <video src={post.media} className="w-full h-full object-cover" muted loop playsInline autoPlay />
            <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-md p-2 rounded-xl text-white"><PlayCircle size={18} /></div>
          </div>
        ) : <img src={post.media} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="" />}
        {animateHeart && <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"><Heart size={100} className="text-white fill-white animate-bounce opacity-80" /></div>}
      </div>

      <div className="px-7 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button onClick={handleLike} className={`transition-all active:scale-150 ${liked ? 'text-red-500' : 'text-gray-800 hover:text-red-500'}`}><Heart size={26} fill={liked ? 'currentColor' : 'none'} strokeWidth={2.5} /></button>
            <button onClick={() => onComment(post)} className="text-gray-800 hover:text-[#007BFF] active:scale-125 transition-all"><MessageCircle size={26} strokeWidth={2.5} /></button>
            <button onClick={() => onShare(post)} className="text-gray-800 hover:text-[#007BFF] active:scale-125 transition-all"><Send size={26} strokeWidth={2.5} /></button>
          </div>
          <button onClick={() => api.savePost(post.id).then(onRefresh)} className={`transition-all active:scale-125 ${currentUser?.savedPosts.includes(post.id) ? 'text-[#007BFF]' : 'text-gray-800 hover:text-blue-400'}`}><Bookmark size={26} fill={currentUser?.savedPosts.includes(post.id) ? 'currentColor' : 'none'} strokeWidth={2.5} /></button>
        </div>
        <div className="space-y-2">
          <p className="text-[11px] font-black text-gray-900 tracking-tight">{post.likes.length} blessings</p>
          <p className="text-sm leading-relaxed text-gray-700 font-medium"><span className="font-black text-gray-900 mr-2">{post.authorName}</span>{post.content}</p>
          <button onClick={() => onComment(post)} className="text-[10px] text-[#007BFF] font-black uppercase tracking-widest pt-1 hover:underline">View all {post.comments.length} reflections</button>
        </div>
      </div>
    </div>
  );
};

// --- REELS PAGE ---

const ReelItem = ({ reel, muted, active, preload, onComment, onOpenLeader, onRefresh, onShare, onInteraction }: any) => {
  const currentUser = api.getCurrentUser();
  const [heartAnim, setHeartAnim] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (active && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.log("Autoplay blocked or interrupted", e);
          // Potential fallback: retry on interaction
        });
      }
    } else if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0; // Reset for better entry next time
    }
  }, [active]);

  const handleLike = async () => {
    await api.likePost(reel.id);
    onRefresh();
  };

  const handleInteractionLocal = (e: React.MouseEvent) => {
    if (e.detail === 2) {
      if (!reel.likes.includes(currentUser?.id || '')) handleLike();
      setHeartAnim(true);
      setTimeout(() => setHeartAnim(false), 800);
    } else {
      onInteraction();
    }
  };

  return (
    <div className="h-full w-full snap-start relative flex flex-col justify-end overflow-hidden group">
      {/* Immersive Video Layer */}
      <div className={`absolute inset-0 bg-black transition-all duration-1000 ease-out ${active ? 'scale-100 opacity-100' : 'scale-[1.05] opacity-0'}`}>
        <video 
          ref={videoRef} 
          src={reel.media} 
          className="w-full h-full object-cover" 
          muted={muted} 
          loop 
          playsInline 
          preload={preload ? "auto" : "metadata"} 
          onClick={handleInteractionLocal}
          onWaiting={() => setIsBuffering(true)}
          onCanPlay={() => setIsBuffering(false)}
          onPlaying={() => setIsBuffering(false)}
        />
      </div>

      {/* Buffering Indicator */}
      {isBuffering && active && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm z-20">
          <div className="flex flex-col items-center space-y-3">
             <div className="w-10 h-10 border-2 border-white/20 border-t-[#007BFF] rounded-full animate-spin"></div>
             <p className="text-[9px] font-black text-white uppercase tracking-[3px] animate-pulse">Receiving Word...</p>
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none"></div>

      {heartAnim && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <Heart size={140} className="text-white fill-white animate-heartPop opacity-95" />
        </div>
      )}
      
      {/* Content Layer */}
      <div className={`p-8 relative z-10 flex items-end justify-between space-x-6 pb-32 transition-all duration-700 ease-out ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
        <div className="flex-1 space-y-4">
          <div className="flex items-center space-x-3">
            <FaithAvatar 
              user={MOCK_LEADERS.find(l => l.id === reel.authorId)!} 
              size="sm" 
              hasRing={false} 
              onClick={() => onOpenLeader(MOCK_LEADERS.find(l => l.id === reel.authorId))} 
            />
            <h4 className="text-sm font-black text-white flex items-center drop-shadow-md">
              {reel.authorName} <CheckCircle2 size={12} className="ml-1 text-[#007BFF]" />
            </h4>
            <button 
              onClick={() => !currentUser?.following.includes(reel.authorId) && api.followUser(reel.authorId).then(onRefresh)} 
              className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-xl text-[10px] font-black text-white uppercase border border-white/20 transition-all active:scale-90 hover:bg-[#007BFF]"
            >
              {currentUser?.following.includes(reel.authorId) ? 'Connected' : 'Connect'}
            </button>
          </div>
          <p className="text-sm text-white/95 line-clamp-2 leading-relaxed font-medium drop-shadow-lg drop-shadow-black/50">
            {reel.content}
          </p>
        </div>
        
        <div className="flex flex-col items-center space-y-7 mb-4">
          <div className="flex flex-col items-center space-y-1">
            <button onClick={handleLike} className="p-2 transition-transform active:scale-150 group">
              <Heart size={30} className={reel.likes.includes(currentUser?.id || '') ? 'text-red-500 fill-red-500' : 'text-white group-hover:text-red-400'} strokeWidth={2.5} />
            </button>
            <span className="text-[10px] font-black text-white drop-shadow-md">{reel.likes.length}</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <button onClick={() => onComment(reel)} className="p-2 transition-transform active:scale-125 group">
              <MessageCircle size={30} className="text-white group-hover:text-[#007BFF]" strokeWidth={2.5} />
            </button>
            <span className="text-[10px] font-black text-white drop-shadow-md">{reel.comments.length}</span>
          </div>
          <button onClick={() => onShare(reel)} className="p-2 transition-transform active:scale-125 group">
            <Share2 size={30} className="text-white group-hover:text-blue-400" strokeWidth={2.5} />
          </button>
          <button onClick={() => api.savePost(reel.id).then(onRefresh)} className="p-2 transition-transform active:scale-125 group">
            <Bookmark size={30} className={currentUser?.savedPosts.includes(reel.id) ? 'text-[#007BFF] fill-[#007BFF]' : 'text-white group-hover:text-[#007BFF]'} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- APP CONTAINER ---

const App = () => {
  const [user, setUser] = useState<User | null>(api.getCurrentUser());
  const [authMode, setAuthMode] = useState<'landing' | 'login' | 'signup'>('landing');
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'reels' | 'messages' | 'profile'>('home');
  const [feedType, setFeedType] = useState<'explore' | 'following'>('explore');
  const [selectedLeader, setSelectedLeader] = useState<User | null>(null);
  const [activeCommentPost, setActiveCommentPost] = useState<Post | null>(null);
  const [activeSharePost, setActiveSharePost] = useState<Post | null>(null);
  const [activeChatRoom, setActiveChatRoom] = useState<User | null>(null);
  const [userListModal, setUserListModal] = useState<{ title: string; users: User[] } | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [muted, setMuted] = useState(false);
  const [tick, setTick] = useState(0);

  // Reels High Performance Management
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const reelsContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<number | null>(null);

  // Search Context State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaithFilter, setSelectedFaithFilter] = useState<Faith | 'All'>('All');

  const refresh = () => setTick(t => t + 1);

  const posts = useMemo(() => {
    let list = [...MOCK_POSTS];
    if (feedType === 'following' && user) list = list.filter(p => user.following.includes(p.authorId));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [feedType, tick, user]);

  const filteredReels = useMemo(() => MOCK_POSTS.filter(p => p.type === 'reel'), []);

  const searchResults = useMemo(() => {
    return MOCK_LEADERS.filter(l => {
      const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            l.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            l.faith.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFaith = selectedFaithFilter === 'All' || l.faith === selectedFaithFilter;
      return matchesSearch && matchesFaith;
    });
  }, [searchQuery, selectedFaithFilter]);

  const handleOpenUserList = async (title: string, userId: string, type: 'followers' | 'following') => {
    let list: User[] = [];
    if (type === 'followers') list = await api.getFollowers(userId);
    else list = await api.getFollowing(userId);
    setUserListModal({ title, users: list });
  };

  const handleReelsScroll = () => {
    if (reelsContainerRef.current) {
      // Debounce slightly for performance or just use accurate calc
      const scrollPos = reelsContainerRef.current.scrollTop;
      const height = reelsContainerRef.current.clientHeight;
      const index = Math.round(scrollPos / height);
      
      if (index !== currentReelIndex) {
        setCurrentReelIndex(index);
      }
    }
  };

  if (!user) {
    if (authMode === 'landing') return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-10 py-20 animate-fadeIn overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-50 rounded-full blur-[100px] opacity-60"></div>
        <div className="w-24 h-24 bg-gradient-to-br from-[#007BFF] to-blue-700 rounded-[2.5rem] flex items-center justify-center text-white font-black text-5xl italic shadow-2xl rotate-3 mb-10">F</div>
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-[0.9]">Walk the Path<br /><span className="text-[#007BFF]">Together.</span></h1>
          <p className="text-gray-400 font-medium text-base px-6">A modern sanctuary connecting seekers with spiritual wisdom.</p>
        </div>
        <div className="w-full space-y-4 px-6 max-w-sm">
          <Button className="w-full py-5 h-16 text-sm uppercase tracking-[2px]" onClick={() => setAuthMode('signup')}>I am a Seeker</Button>
          <Button variant="outline" className="w-full py-5 h-16 text-sm uppercase tracking-[2px]" onClick={() => setAuthMode('signup')}>I am a Guide</Button>
          <p className="pt-8 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">Already part of us? <button onClick={() => setAuthMode('login')} className="ml-2 font-black text-[#007BFF]">Sign In</button></p>
        </div>
      </div>
    );
    return <AuthScreen mode={authMode} setMode={setAuthMode} onAuth={async (e: any, r: any) => { setUser(await api.login(e, r)); refresh(); }} />;
  }

  return (
    <div className="h-full max-w-md mx-auto bg-white shadow-2xl relative flex flex-col overflow-hidden">
      {/* Dynamic Header */}
      {activeTab !== 'reels' && (
        <header className="px-6 pt-6 pb-2 bg-white sticky top-0 z-[100] transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-black italic tracking-tighter text-[#007BFF]">FaithConnect</h1>
            <div className="flex items-center space-x-3">
              <button onClick={() => setShowNotifications(true)} className="p-3 bg-gray-50 rounded-[1.2rem] text-gray-900 relative active:scale-90 transition-all">
                <Bell size={20} />
                <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
              </button>
            </div>
          </div>
          {activeTab === 'home' && (
            <div className="flex space-x-8 border-b border-gray-50 mb-1">
              {['explore', 'following'].map(t => (
                <button key={t} onClick={() => setFeedType(t as any)} className={`pb-3 text-[10px] font-black uppercase tracking-[2px] transition-all relative ${feedType === t ? 'text-gray-900' : 'text-gray-300'}`}>
                  {t}
                  {feedType === t && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#007BFF] rounded-full"></div>}
                </button>
              ))}
            </div>
          )}
        </header>
      )}

      {/* Main Viewport */}
      <main className={`flex-1 overflow-y-auto no-scrollbar ${activeTab === 'reels' ? 'pb-0' : 'pb-24'}`}>
        {activeTab === 'home' && (
          <div className="animate-fadeIn">
            <StoryBar leaders={MOCK_LEADERS} onOpenStory={setSelectedLeader} />
            <div className="px-6 space-y-2 mt-4">
              {posts.map(post => (
                <PostCard 
                  key={post.id} post={post} onRefresh={refresh} 
                  onComment={setActiveCommentPost} 
                  onOpenLeader={setSelectedLeader} 
                  onShare={setActiveSharePost} 
                />
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'search' && (
          <div className="flex flex-col min-h-full bg-white animate-fadeIn">
            <div className="px-6 py-6 space-y-6">
              <div className="space-y-1">
                <h2 className="text-3xl font-black tracking-tighter text-gray-900">Discover Guides</h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Seek wisdom across all paths</p>
              </div>

              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#007BFF] transition-colors">
                  <Search size={20} />
                </div>
                <input 
                  type="text"
                  placeholder="Search by name, path or bio..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-[1.8rem] pl-14 pr-6 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-50/50 transition-all placeholder:text-gray-300" 
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-5 top-1/2 -translate-y-1/2 p-1 bg-gray-200 rounded-full text-gray-500 hover:bg-gray-300">
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar pb-2">
                <div className="flex items-center justify-center p-3 bg-blue-50 text-[#007BFF] rounded-2xl shrink-0">
                  <Filter size={16} />
                </div>
                {['All', ...FAITH_OPTIONS].map(f => {
                  const active = selectedFaithFilter === f;
                  return (
                    <button 
                      key={f} 
                      onClick={() => setSelectedFaithFilter(f as any)}
                      className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border ${active ? 'bg-[#007BFF] text-white border-[#007BFF] shadow-blue-100' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200 hover:text-gray-600'}`}
                    >
                      {f}
                    </button>
                  );
                })}
              </div>
            </div>

            {!searchQuery && selectedFaithFilter === 'All' && (
              <div className="space-y-10 py-4">
                <div className="space-y-6">
                  <div className="px-6 flex items-center space-x-2">
                    <Sparkles size={16} className="text-[#007BFF]" />
                    <h3 className="text-[11px] font-black uppercase tracking-[2px] text-gray-900">Featured Guides</h3>
                  </div>
                  <div className="flex space-x-4 overflow-x-auto no-scrollbar px-6">
                    {MOCK_LEADERS.slice(0, 3).map(l => (
                      <div key={l.id} onClick={() => setSelectedLeader(l)} className="w-[280px] shrink-0 relative rounded-[2.5rem] overflow-hidden aspect-[4/5] shadow-xl shadow-blue-50 group cursor-pointer">
                        <img src={l.profilePhoto} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
                        <div className="absolute bottom-6 left-6 right-6 space-y-2">
                          <p className="text-[9px] font-black text-blue-400 uppercase tracking-[3px]">{l.faith}</p>
                          <h4 className="text-xl font-black text-white flex items-center">{l.name} <CheckCircle2 size={16} className="ml-2 text-[#007BFF]" /></h4>
                          <p className="text-[11px] font-medium text-white/70 line-clamp-1">{l.bio}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="px-6 flex items-center space-x-2">
                    <Activity size={16} className="text-[#007BFF]" />
                    <h3 className="text-[11px] font-black uppercase tracking-[2px] text-gray-900">Explore Circles</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 px-6">
                    {FAITH_OPTIONS.map(f => (
                      <div key={f} onClick={() => setSelectedFaithFilter(f)} className="p-6 rounded-[2rem] bg-gray-50 flex flex-col items-center text-center space-y-3 hover:bg-white hover:shadow-xl hover:shadow-gray-100 transition-all cursor-pointer border border-transparent hover:border-gray-50">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#007BFF]">
                          <Hash size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-900">{f} Path</p>
                          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{MOCK_LEADERS.filter(l => l.faith === f).length} Guides</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {(searchQuery || selectedFaithFilter !== 'All') && (
              <div className="px-6 space-y-4 pb-20">
                <div className="flex items-center justify-between mb-2">
                   <h3 className="text-[11px] font-black uppercase tracking-[2px] text-gray-400">{searchResults.length} Souls Found</h3>
                </div>
                {searchResults.length === 0 ? (
                  <div className="py-24 text-center space-y-6">
                    <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-gray-200">
                      <Search size={32} />
                    </div>
                    <p className="text-gray-900 text-sm font-black">No Guides Found</p>
                  </div>
                ) : searchResults.map(l => (
                  <div key={l.id} onClick={() => setSelectedLeader(l)} className="flex items-center p-5 bg-gray-50/30 rounded-[2rem] border border-transparent hover:border-gray-100 hover:bg-white transition-all cursor-pointer group shadow-sm">
                    <FaithAvatar user={l} size="md" hasRing={true} ringActive={l.onlineStatus} />
                    <div className="ml-5 flex-1 space-y-0.5">
                      <h4 className="text-sm font-black text-gray-900 flex items-center group-hover:text-[#007BFF] transition-colors">{l.name} {l.role === 'leader' && <CheckCircle2 size={12} className="ml-1 text-[#007BFF]"/>}</h4>
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{l.faith} Guide</p>
                      <p className="text-[11px] text-gray-400 line-clamp-1 font-medium">{l.bio}</p>
                    </div>
                    <ChevronRight size={18} className="text-gray-300 group-hover:translate-x-1" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reels' && (
          <div 
            ref={reelsContainerRef}
            onScroll={handleReelsScroll}
            className="h-full w-full snap-y snap-mandatory overflow-y-scroll no-scrollbar animate-fadeIn bg-black"
            style={{ scrollBehavior: 'smooth' }}
          >
            {filteredReels.map((reel, idx) => (
              <ReelItem 
                key={reel.id} 
                reel={reel} 
                active={activeTab === 'reels' && currentReelIndex === idx} 
                // Pre-load current and next two for smoother transitions
                preload={idx >= currentReelIndex && idx <= currentReelIndex + 2}
                muted={muted} 
                onInteraction={() => setMuted(!muted)} 
                onComment={setActiveCommentPost} 
                onRefresh={refresh} 
                onShare={setActiveSharePost} 
                onOpenLeader={setSelectedLeader} 
              />
            ))}
          </div>
        )}

        {activeTab === 'messages' && <ChatInbox onOpenRoom={setActiveChatRoom} />}

        {activeTab === 'profile' && (
          <div className="p-8 space-y-10 animate-fadeIn">
            <div className="flex items-center justify-between">
              <FaithAvatar user={user} size="xl" hasRing={true} />
              <div className="flex space-x-10 text-center">
                <div className="cursor-pointer active:scale-95 transition-transform" onClick={() => handleOpenUserList('Followers', user.id, 'followers')}>
                  <p className="text-xl font-black text-gray-900">{user.followers.length}</p>
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Followers</p>
                </div>
                <div className="cursor-pointer active:scale-95 transition-transform" onClick={() => handleOpenUserList('Following', user.id, 'following')}>
                  <p className="text-xl font-black text-gray-900">{user.following.length}</p>
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Following</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div><h2 className="text-3xl font-black text-gray-900 tracking-tighter">{user.name}</h2><p className="text-[10px] font-black text-[#007BFF] uppercase tracking-[4px]">{user.faith} {user.role}</p></div>
              <p className="text-sm font-medium text-gray-500 leading-relaxed">Spiritual seeker exploring the depths of community and faith. Sharing my journey towards the light.</p>
              <div className="grid grid-cols-2 gap-4">
                <Button className="py-3 text-[10px]">Edit Profile</Button>
                <Button variant="outline" className="py-3 text-[10px]" onClick={() => { api.logout(); setUser(null); setAuthMode('landing'); }}>Sign Out</Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {[...Array(9)].map((_, i) => <div key={i} className="aspect-square bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center text-gray-200"><PlayCircle size={24} /></div>)}
            </div>
          </div>
        )}
      </main>

      {/* Persistent Navigation */}
      <nav className={`absolute left-6 right-6 p-2 bg-white/95 backdrop-blur-xl border border-gray-50 rounded-[2.8rem] flex items-center justify-around shadow-2xl transition-all duration-500 z-[150] ${activeTab === 'reels' ? 'bottom-8 bg-black/20 text-white border-white/10' : 'bottom-6 shadow-black/5'}`}>
        {[
          { id: 'home', icon: Home }, { id: 'search', icon: Search },
          { id: 'reels', icon: PlayCircle }, { id: 'messages', icon: MessageSquare },
          { id: 'profile', icon: UserIcon }
        ].map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`p-4 rounded-[2rem] transition-all duration-300 ${activeTab === item.id ? 'bg-[#007BFF] text-white shadow-lg shadow-blue-200 scale-110' : 'text-gray-300 hover:text-gray-500 hover:scale-105'}`}>
            <item.icon size={20} strokeWidth={activeTab === item.id ? 3 : 2} />
          </button>
        ))}
      </nav>

      {/* Global Overlay Components */}
      {activeCommentPost && <CommentModal post={activeCommentPost} onClose={() => setActiveCommentPost(null)} onRefresh={refresh} />}
      {activeSharePost && <ShareModal post={activeSharePost} onClose={() => setActiveSharePost(null)} />}
      {activeChatRoom && <ChatRoom otherUser={activeChatRoom} onBack={() => setActiveChatRoom(null)} />}
      {userListModal && (
        <UserListModal 
          title={userListModal.title} 
          users={userListModal.users} 
          onClose={() => setUserListModal(null)}
          onSelectUser={(u: User) => {
            setUserListModal(null);
            setSelectedLeader(u);
          }}
        />
      )}
      {showNotifications && (
        <div className="fixed inset-0 bg-white z-[3000] animate-slideInRight flex flex-col">
          <header className="px-8 py-8 flex items-center justify-between border-b border-gray-50">
            <h2 className="text-3xl font-black tracking-tighter">Activity</h2>
            <button onClick={() => setShowNotifications(false)} className="p-4 bg-gray-50 rounded-3xl text-gray-400"><X size={24}/></button>
          </header>
          <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 rounded-[2rem] bg-gray-50/50 group active:scale-[0.98] transition-all">
                <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 shrink-0 p-0.5 overflow-hidden"><img src={`https://picsum.photos/seed/${i + 20}/100`} /></div>
                <div className="flex-1"><p className="text-sm font-medium"><span className="font-black">Leader {i+1}</span> blessed your reflection.</p><p className="text-[9px] font-black text-gray-300 uppercase">2 hours ago</p></div>
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#007BFF]"><Heart size={16} fill="currentColor" /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedLeader && (
        <div className="fixed inset-0 bg-white z-[2500] animate-slideInRight flex flex-col">
          <header className="p-6 border-b border-gray-50 flex items-center space-x-4 sticky top-0 bg-white/95 backdrop-blur-md">
            <button onClick={() => setSelectedLeader(null)} className="p-2 text-gray-400"><ChevronLeft size={28}/></button>
            <h3 className="font-black text-sm uppercase tracking-widest text-gray-400">{selectedLeader.role === 'leader' ? 'Guide Profile' : 'Seeker Profile'}</h3>
          </header>
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <div className="p-10 flex flex-col items-center text-center space-y-6">
              <FaithAvatar user={selectedLeader} size="xl" hasRing={true} ringActive={selectedLeader.onlineStatus} />
              <div className="space-y-2">
                <h2 className="text-4xl font-black tracking-tighter text-gray-900 flex items-center justify-center">
                  {selectedLeader.name} 
                  {selectedLeader.role === 'leader' && <CheckCircle2 size={24} className="ml-2 text-[#007BFF]"/>}
                </h2>
                <p className="text-[11px] font-black text-blue-400 uppercase tracking-[4px]">{selectedLeader.faith} {selectedLeader.role}</p>
              </div>
              <p className="text-sm font-medium text-gray-500 leading-relaxed max-w-xs">{selectedLeader.bio || "Sharing ancient wisdom for the modern soul. Join our digital sanctuary for daily guidance and community prayer."}</p>
              <div className="flex space-x-12">
                <div className="cursor-pointer active:scale-95 transition-transform" onClick={() => handleOpenUserList('Followers', selectedLeader.id, 'followers')}>
                  <p className="text-2xl font-black text-gray-900">{selectedLeader.followers.length}</p>
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Followers</p>
                </div>
                <div className="cursor-pointer active:scale-95 transition-transform" onClick={() => handleOpenUserList('Following', selectedLeader.id, 'following')}>
                  <p className="text-2xl font-black text-gray-900">{selectedLeader.following.length}</p>
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Following</p>
                </div>
              </div>
              <div className="flex w-full space-x-4">
                <Button className="flex-1 py-4 text-[10px]" onClick={() => { api.followUser(selectedLeader.id); refresh(); }}>{user.following.includes(selectedLeader.id) ? 'Connected' : 'Connect'}</Button>
                <Button variant="secondary" className="flex-1 py-4 text-[10px]" onClick={() => { setActiveChatRoom(selectedLeader); setSelectedLeader(null); }}>Message</Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-0.5 p-0.5">
              {[...Array(12)].map((_, i) => <div key={i} className="aspect-square bg-gray-50 border border-white flex items-center justify-center text-gray-100 overflow-hidden"><img src={`https://picsum.photos/seed/guide_${selectedLeader.id}_${i}/400`} className="w-full h-full object-cover" /></div>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
