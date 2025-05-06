import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { ScrollArea } from "../components/ui/scroll-area";
import { useUserContext } from "../context/UserContext";
import { Send, Search } from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import { API_BASE_URL } from "../config";
import { useToast } from "../hooks/use-toast";

const Messages = () => {
  const { user } = useUserContext();
  const { toast } = useToast();

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [rideId, setRideId] = useState("");
  const [rides, setRides] = useState([]);

  useEffect(() => {
    if (user) fetchChats();
  }, [user]);

  useEffect(() => {
    const fetchUserRides = async () => {
      if (!user) return;
      try {
        const response = await fetch(`${API_BASE_URL}/rides/user/rides`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch rides");
        const data = await response.json();
        // Only include rides that are not completed
        setRides(data.filter((ride) => ride.status !== "completed"));
      } catch (error) {
        console.error("Error fetching rides for chat:", error);
        toast({
          title: "Error",
          description: "Failed to fetch your rides for chat.",
          variant: "destructive",
        });
      }
    };
    fetchUserRides();
  }, [user]);

  const fetchChats = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/chats/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch chats");
      let data = await response.json();
      // Build 'with' field for each chat
      data = data.map((chat) => {
        const otherUser = chat.participants.find((p) => p._id !== user._id);
        return {
          ...chat,
          with: {
            name: otherUser?.name || "Unknown",
            photo: otherUser?.profilePicture || "",
            _id: otherUser?._id || "",
          },
          messages: [], // will be filled when selected
        };
      });
      setChats(data);
      if (data.length > 0) {
        selectChat(data[0]);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      toast({
        title: "Error",
        description: "Failed to load chats. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch messages");
    return await response.json();
  };

  const selectChat = async (chat) => {
    setSelectedChat({ ...chat, messages: [] });
    try {
      const messages = await fetchMessages(chat._id);
      setSelectedChat({ ...chat, messages });
    } catch (error) {
      setSelectedChat({ ...chat, messages: [] });
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat || !user) return;
    if (!rideId) {
      toast({
        title: "Error",
        description: "Please select a ride to start a conversation.",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await fetch(
        `${API_BASE_URL}/chats/${selectedChat._id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ content: message, rideId }),
        }
      );
      if (!response.ok) throw new Error("Failed to send message");
      const newMessage = await response.json();
      setSelectedChat((prev) => ({
        ...prev,
        messages: [...(prev.messages || []), newMessage],
      }));
      setMessage("");
      fetchChats();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "";
    return (
      date.toLocaleDateString([], { month: "short", day: "numeric" }) +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const filteredChats = chats.filter((chat) =>
    chat.with.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Messages</h1>
        <p className="text-gray-600 mb-6">
          Communicate with other users about your rides.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[70vh]">
          {/* Chat List */}
          <Card className="md:col-span-1">
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Conversations</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  className="pl-9"
                  placeholder="Search messages"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(70vh-120px)]">
                {isLoading ? (
                  <div className="p-4 space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 animate-pulse"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredChats.length > 0 ? (
                  <div>
                    {filteredChats.map((chat) => (
                      <div
                        key={chat._id}
                        className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-100 transition-colors ${
                          selectedChat?._id === chat._id ? "bg-gray-100" : ""
                        }`}
                        onClick={() => selectChat(chat)}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={chat.with.photo}
                            alt={chat.with.name}
                          />
                          <AvatarFallback>
                            {chat.with.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium truncate">
                              {chat.with.name}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {chat.lastMessage && chat.lastMessage.createdAt
                                ? formatTimestamp(chat.lastMessage.createdAt)
                                : ""}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-500 truncate">
                              {chat.lastMessage &&
                              typeof chat.lastMessage === "object" &&
                              chat.lastMessage.content
                                ? chat.lastMessage.content
                                : typeof chat.lastMessage === "string"
                                ? chat.lastMessage
                                : ""}
                            </p>
                            {chat.unreadCount > 0 && (
                              <span className="inline-flex items-center justify-center h-5 w-5 bg-primary text-white rounded-full text-xs font-medium">
                                {chat.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No conversations found
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Content */}
          <Card className="md:col-span-2">
            {selectedChat ? (
              <>
                <CardHeader className="p-4 border-b">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={selectedChat.with.photo}
                        alt={selectedChat.with.name}
                      />
                      <AvatarFallback>
                        {selectedChat.with.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{selectedChat.with.name}</h3>
                      <p className="text-sm text-gray-500">
                        {selectedChat.ride &&
                        selectedChat.ride.from &&
                        selectedChat.ride.to
                          ? `${selectedChat.ride.from.city} → ${selectedChat.ride.to.city}`
                          : "Ride info unavailable"}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4">
                  <ScrollArea className="h-[calc(70vh-200px)]">
                    <div className="space-y-4">
                      {selectedChat.messages.map((msg) => {
                        const senderId = String(msg.sender?._id || msg.sender);
                        const currentUserId = String(user._id);
                        const isCurrentUser = senderId === currentUserId;
                        return (
                          <div
                            key={msg._id}
                            className={`flex ${
                              isCurrentUser ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                isCurrentUser
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p>{msg.content || msg.text}</p>
                              <span className="text-xs opacity-70 mt-1 block">
                                {msg.createdAt
                                  ? formatTimestamp(msg.createdAt)
                                  : ""}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>

                  <div className="flex gap-2 mt-4">
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a conversation to start messaging
              </div>
            )}
          </Card>
        </div>

        {/* Ride selection dropdown for new chat creation */}
        <div className="mb-4">
          <label htmlFor="ride-select" className="block mb-1 font-medium">
            Select Ride for Conversation
          </label>
          <select
            id="ride-select"
            className="w-full border p-2 rounded"
            value={rideId}
            onChange={(e) => setRideId(e.target.value)}
          >
            <option value="">-- Select a ride --</option>
            {rides.map((ride) => (
              <option key={ride._id} value={ride._id}>
                {ride.from?.city || ride.from} → {ride.to?.city || ride.to} (
                {new Date(ride.departureTime).toLocaleDateString()}{" "}
                {new Date(ride.departureTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                )
              </option>
            ))}
          </select>
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages;
