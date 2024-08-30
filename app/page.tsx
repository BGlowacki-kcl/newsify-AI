'use client'
import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import './globals.css'
import StarbackCanvas from './components/StarbackCanvas';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons'
import { useCallback } from 'react';

export default function Home() {
  const [hotWords, setHotWords] = useState('')
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm your latest news manager. Type what you want to know and I'll try my best to find articles just for you!`,
    },
  ])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // const fetchHotWords = async () => {
  //   try {
  //     const response = await fetch('/api/titles')
  //     if (!response.ok) {
  //       throw new Error('Network response was not ok')
  //     }
  //     const data = await response.json()
  //     setHotWords(data)
  //     console.log(messages)

  //     // Update the first message with the fetched hot words
  //     setMessages((messages) => [
  //       {
  //         ...messages[0],
  //         content: `Hi! I'm your latest news manager. Type what you want to know and I'll try my best to find articles just for you! Hot topics right now: ${data.join(', ')}`,
  //       },
  //       ...messages.slice(1), // keep the rest of the messages
  //     ])
  //   } catch (error) {
  //     console.error('Failed to fetch hot words:', error)
  //   }
  // }

  // useEffect(() => {
  //   fetchHotWords();
  // }, [fetchHotWords]);


const fetchHotWords = useCallback(async () => {
  try {
    const response = await fetch('/api/titles');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    setHotWords(data);

    // Update the first message with the fetched hot words
    setMessages((messages) => [
      {
        ...messages[0],
        content: `Hi! I'm your latest news manager. Type what you want to know and I'll try my best to find articles just for you! Hot topics right now: ${data.join(', ')}`,
      },
      ...messages.slice(1), // keep the rest of the messages
    ]);
  } catch (error) {
    console.error('Failed to fetch hot words:', error);
  }
}, [setHotWords, setMessages]);

useEffect(() => {
  fetchHotWords();
}, [fetchHotWords]);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;  // Don't send empty messages
    setIsLoading(true)

    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])
  
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })
  
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      
      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
  
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ]
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
    }
    setIsLoading(false)
  }

  const [status, setStatus] = useState<string | null>(null);

  const handleFetchNews = async () => {
      setStatus('Fetching news articles...');
      try {
          const response = await fetch('/api/news', {
              method: 'POST',
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Unknown error');
        }

          const data = await response.json();
          setStatus(data.message || 'No message received.');
      } catch (error) {
        if (error instanceof Error) {
          setStatus(`Failed to fetch news articles. Error -> ${error.message}`);
        } else {
          setStatus('Failed to fetch news articles. Unknown error occurred.');
        }
      }
  };

  const restartChat = (() => {
    setMessages(() => [messages[0]])
  })

  const handleKeyPress = (event: { key: string; shiftKey: any; preventDefault: () => void }) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"

    >
      <StarbackCanvas />
      <Stack
        zIndex={1}
        position="relative"
        className='font-serif top-5 rounded-lg border border-black w-3/5 space-y-8'
      >
        <Typography
          className='text-center text-3xl font-bold'
          color="#EBD3F8"
        >
          Newsify AI
        </Typography>
        <Typography
          className='text-center text-2xl'
          color="#EBD3F8"
        >
          The only news source you will ever need! Ask me whatever you want. With fresh articles and long-term knowledge, you will not find a question that can make me confused!
        </Typography>
        
      </Stack>
      
      <Box
        height="100px"
      >
      </Box>
      
      <Stack
        position= 'relative'
        zIndex= {1}
        direction={'column'}
        width="1000px"
        height="400px"
        border="2px solid grey"
        className='bg-slate-600/90 shadow-md rounded-xl'
        p={2}
        spacing={4}
      >
        <Box
          className="bg-black  h-32 w-32 rounded-full border-2 border-white flex justify-center items-center"
          position="absolute"
          top={-70}
          left={-70}
          zIndex={2}
        >
          <Image 
            src="/robo-advisor.png"
            alt="newspaper"
            width={80}
            height={80}  
            className="animate-pulse"
          />
        </Box>
        <Box
          className="bg-black  h-10 w-10 rounded-full border-2 border-white flex justify-center items-center"
          position="absolute"
          top={-60}
          right={-25}
          zIndex={2}
          onClick={isLoading ? undefined : restartChat}  // Disable click when loading
          sx={{
            cursor: isLoading ? 'not-allowed' : 'pointer',  // Change cursor to 'not-allowed' when loading
            opacity: isLoading ? 0.5 : 1,  // Reduce opacity when loading
          }}
        >
          <FontAwesomeIcon icon={faArrowsRotate} color="white" />
        </Box>
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? '#7A1CAC'
                    : '#EBD3F8'
                }
                color={
                  message.role === 'assistant'
                    ? 'white'
                    : 'black'
                }
                className='opacity-100'
                borderRadius={16}
                p={2}
              >
                {message.content}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
            sx={{
              input: { color: 'white' }, // Text color inside the input
              label: { color: 'white' }, // Label color
              '.MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'white', // Border color
                },
                '&:hover fieldset': {
                  borderColor: 'white', // Border color on hover
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white', // Border color when focused
                },
              },
              backgroundColor: '#2E073F', // Background color of the input field
            }}
          />
          <Button 
            variant="contained"  
            onClick={sendMessage}
            sx={{
              backgroundColor: '#2E073F',
              '&:hover': {
                backgroundColor: '#5a2173', // A slightly darker shade for the hover state
              },
            }}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
//<a href="https://www.flaticon.com/free-icons/rpa" title="rpa icons">Rpa icons created by gravisio - Flaticon</a>
//<a href="https://www.flaticon.com/free-icons/newspaper" title="newspaper icons">Newspaper icons created by Eucalyp - Flaticon</a>