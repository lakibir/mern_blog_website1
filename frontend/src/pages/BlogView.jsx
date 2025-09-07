import React, { useEffect, useState } from 'react'
import {
    Breadcrumb,
    // BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Link, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bookmark, Heart, MessageSquare, Share2 } from 'lucide-react'
import CommentBox from '@/components/CommentBox'
import axios from 'axios'
import { FaHeart, FaRegHeart } from 'react-icons/fa6'
import { setBlog } from '@/redux/blogSlice'
import { toast } from 'sonner'

const BlogView = () => {
    const params = useParams()
    const blogId = params.blogId
    const { blog } = useSelector(store => store.blog)
    const { user } = useSelector(store => store.auth)
    const selectedBlog = blog.find(blog => blog._id === blogId)
    const [blogLike, setBlogLike] = useState(selectedBlog?.likes.length)
    const { comment } = useSelector(store => store.comment)
    const [liked, setLiked] = useState(selectedBlog?.likes.includes(user?._id) || false);
    const dispatch = useDispatch()
    console.log(selectedBlog);

    const likeOrDislikeHandler = async () => {
        try {
            const action = liked ? 'dislike' : 'like';
            const res = await axios.get(`https://mern-blog-website1-tpd1.onrender.com//blog/${selectedBlog?._id}/${action}`, { withCredentials: true })
            if (res.data.success) {
                const updatedLikes = liked ? blogLike - 1 : blogLike + 1;
                setBlogLike(updatedLikes);
                setLiked(!liked)

                //apne blog ko update krunga
                const updatedBlogData = blog.map(p =>
                    p._id === selectedBlog._id ? {
                        ...p,
                        likes: liked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id]
                    } : p
                )
                toast.success(res.data.message);
                dispatch(setBlog(updatedBlogData))
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message)

        }
    }

    const changeTimeFormat = (isoDate) => {
        const date = new Date(isoDate);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        const formattedDate = date.toLocaleDateString('en-GB', options);
        return formattedDate
    }

    // const handleShare = (blogId) => {
    //     const blogUrl = `${window.location.origin}/blogs/${blogId}`;
    //     navigator.clipboard.writeText(blogUrl).then(() => {
    //         toast.success('Blog link copied to clipboard!');
    //     }).catch((err) => {
    //         console.error('Failed to copy:', err);
    //     });
    // };
    const handleShare = (blogId) => {
        const blogUrl = `${window.location.origin}/blogs/${blogId}`;
      
        if (navigator.share) {
          navigator
            .share({
              title: 'Check out this blog!',
              text: 'Read this amazing blog post.',
              url: blogUrl,
            })
            .then(() => console.log('Shared successfully'))
            .catch((err) => console.error('Error sharing:', err));
        } else {
          // fallback: copy to clipboard
          navigator.clipboard.writeText(blogUrl).then(() => {
            toast.success('Blog link copied to clipboard!');
          });
        }
      };

      useEffect(()=>{
        window.scrollTo(0,0)
      },[])
    return (
        <div className='pt-14'>
            <div className='max-w-6xl p-10 mx-auto'>
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <Link to={'/'}><BreadcrumbLink >Home</BreadcrumbLink></Link>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />


                        <BreadcrumbItem>
                            <Link to={'/blogs'}><BreadcrumbLink >Blogs</BreadcrumbLink></Link>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{selectedBlog.title}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                {/* Blog Header */}
                <div className="my-8">
                    <h1 className="mb-4 text-4xl font-bold tracking-tight">{selectedBlog.title}</h1>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <Avatar>
                                <AvatarImage src={selectedBlog.author.photoUrl} alt="Author" />
                                <AvatarFallback>JD</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">{selectedBlog.author.firstName} {selectedBlog.author.lastName}</p>
                                <p className="text-sm text-muted-foreground">{selectedBlog.author.occupation}</p>
                            </div>
                        </div>
                        <div className="text-sm text-muted-foreground">Published on {changeTimeFormat(selectedBlog.createdAt)} • 8 min read</div>
                    </div>
                </div>

                {/* Featured Image */}
                <div className="mb-8 overflow-hidden rounded-lg">
                    <img
                        src={selectedBlog?.thumbnail}
                        alt="Next.js Development"
                        width={1000}
                        height={500}
                        className="object-cover w-full"
                    />
                    <p className="mt-2 text-sm italic text-muted-foreground">{selectedBlog.subtitle}</p>
                </div>

                <p className='' dangerouslySetInnerHTML={{ __html: selectedBlog.description }} />

                <div className='mt-10'>
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-8">
                        <Badge variant="secondary">Next.js</Badge>
                        <Badge variant="secondary">React</Badge>
                        <Badge variant="secondary">Web Development</Badge>
                        <Badge variant="secondary">JavaScript</Badge>
                    </div>

                    {/* Engagement */}
                    <div className="flex items-center justify-between py-4 mb-8 border-gray-300 border-y dark:border-gray-800">
                        <div className="flex items-center space-x-4">
                            <Button onClick={likeOrDislikeHandler} variant="ghost" size="sm" className="flex items-center gap-1">
                                {/* <Heart className="w-4 h-4"/> */}
                                {
                                    liked ? <FaHeart size={'24'} className='text-red-600 cursor-pointer' /> : <FaRegHeart size={'24'} className='text-white cursor-pointer hover:text-gray-600' />
                                }

                                <span>{blogLike}</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                <span>{comment.length} Comments</span>
                            </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                                <Bookmark className="w-4 h-4" />
                            </Button>
                            <Button onClick={()=>handleShare(selectedBlog._id)} variant="ghost" size="sm">
                                <Share2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                </div>
                <CommentBox selectedBlog={selectedBlog} />

                {/* Author Bio */}
                {/* <Card className="mb-12">
                    <CardContent className="flex items-start pt-6 space-x-4">
                        <Avatar className="w-12 h-12">
                            <AvatarImage src="/placeholder.svg?height=48&width=48" alt="Author" />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="mb-1 font-semibold">About Jane Doe</h3>
                            <p className="mb-3 text-sm text-muted-foreground">
                                Jane is a lead developer with over 10 years of experience in web development. She specializes in React and
                                Next.js and has helped numerous companies build modern, performant websites.
                            </p>
                            <Button variant="outline" size="sm">
                                Follow
                            </Button>
                        </div>
                    </CardContent>
                </Card> */}
            </div>
        </div>
    )
}

export default BlogView
