/** @format */

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import FriendRequestsSidebarOptions from "@/components/FriendRequestsSidebarOptions";
import { Icon, Icons } from "@/components/Icons";
import MobileChatLayout from "@/components/MobileChatLayout";
import SidebarChatList from "@/components/SidebarChatList";
import SignOutButton from "@/components/SignOutButton";
import { getFriendsByUserId } from "@/helpers/get-friends-by-userId";
import { fetchRedis } from "@/helpers/redis";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FC, ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

interface SidebarOption {
  id: number;
  name: string;
  href: string;
  Icon: Icon;
}

const sidebarOptions: SidebarOption[] = [
  {
    id: 1,
    name: "Add friend",
    href: "/dashboard/add",
    Icon: "UserPlus",
  },
];

const Layout = async ({ children }: LayoutProps) => {
  const session = await getServerSession(authOptions);

  if (!session) notFound(); // If the user is not logged in, Do not show him the page and show a 404 page instead

  const friends = await getFriendsByUserId(session.user.id);

  const unseenRequestCount = (
    (await fetchRedis(
      "smembers", // smembers is a redis command to get all the members of a set
      `user:${session.user.id}:incoming_friend_requests`
    )) as User[]
  ).length;

  return (
    <div className='w-full h-screen grid grid-rows-[10%_auto] lg:grid-rows-none lg:grid-cols-[25%_auto]'>
      <div className='lg:hidden'>
        <MobileChatLayout
          friends={friends}
          session={session}
          unseenRequestCount={unseenRequestCount}
          sidebarOptions={sidebarOptions}
        />
      </div>
      <div className='hidden lg:flex h-full w-full max-w-xs grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6'>
        <Link href='/dashboard' className='flex h-16 shrink-0 items-center'>
          <Icons.Logo className='h-8 w-auto text-indigo-600' />
        </Link>

        {friends.length > 0 ? (
          <div className='text-xs font-semibold leading-6 text-gray-400'>
            Your chats
          </div>
        ) : null}

        <nav className='flex flex-1 flex-col'>
          <ul role='list' className='flex flex-1 flex-col gap-y-7'>
            <li>
              {/* Render a client component here as we need to show chats in real time */}
              <SidebarChatList friends={friends} sessionId={session.user.id} />
            </li>
            <li>
              <div className='text-xs font-semibold leading-6 text-gray-400'>
                Overview
              </div>

              <ul role='list' className='-mx-2 mt-2 space-y-1'>
                {sidebarOptions.map((option) => {
                  const Icon = Icons[option.Icon];
                  return (
                    <li key={option.id}>
                      <Link
                        href={option.href}
                        className='text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex gap-3 rounded-md p-2 text-sm leading-6 font-semibold'
                      >
                        <span className='text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white'>
                          <Icon className='h-4 w-4' />
                        </span>
                        <span className='truncate'>{option.name}</span>
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <FriendRequestsSidebarOptions
                    sessionId={session.user.id}
                    initialUnseenRequestCount={unseenRequestCount}
                  />
                </li>
              </ul>
            </li>

            <li className='-mx-6 mt-auto flex items-center'>
              <div className='flex flex-1 items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900'>
                <div className='relative h-8 w-8 bg-gray-50'>
                  <Image
                    fill
                    referrerPolicy='no-referrer'
                    src={session.user.image || ""}
                    alt='User profile picture'
                    className='rounded-full'
                  />
                </div>

                <span className='sr-only'>Your profile</span>
                <div className='flex flex-col'>
                  <span aria-hidden='true'>{session.user.name}</span>
                  <span className='text-xs text-zinc-400' aria-hidden='true'>
                    {session.user.email}
                  </span>
                </div>
                {/* By default, NextJs images are absolute */}
              </div>
              <SignOutButton className='h-full aspect-square' />{" "}
              {/* //! Why not directly rendered the button here.Because this page is a server component and a button click is a client event to handle so used a new file */}
            </li>
          </ul>
        </nav>
      </div>
      <div>
        <aside className='max-h-screen container w-full h-screen'>
          {children}
        </aside>
      </div>
    </div>
  );
};

export default Layout;
