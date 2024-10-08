/** @format */

"use client";

import { FC, useState } from "react";
import { Button } from "./ui/Button";
import { addFriendSchema } from "@/schemas/addFriend";
import { z } from "zod";
import axios, { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "./ui/use-toast";

interface AddFriendButtonProps {}

type FormData = z.infer<typeof addFriendSchema>;

const AddFriendButton: FC<AddFriendButtonProps> = ({}) => {
  const [showSuccessState, setshowSuccessState] = useState<boolean>(false);

  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(addFriendSchema),
  });

  const addFriend = async (email: string) => {
    try {
      const validatedEmail = addFriendSchema.parse({ email });

      await axios.post("/api/friends/add", {
        email: validatedEmail,
      });

      setshowSuccessState(true);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError("email", {
          message: error.message,
        });
        return;
      }

      if (error instanceof AxiosError) {
        setError("email", {
          message: error.response?.data || error.message,
        });
        return;
      }

      setError("email", {
        message: "An unknown error occurred",
      });

      toast({
        title: "An error occurred",
        description: "Please try again later",
        variant: "destructive",
      })
    }
  };

  const onSubmit = (data: FormData) => {
    addFriend(data.email);
  };
  return (
    <form className='max-w-sm' onSubmit={handleSubmit(onSubmit)}>
      <label
        htmlFor='email'
        className='block text-sm font-medium leading-6 text-gray-900'
      >
        Add friend by E-Mail
      </label>
      <div className='mt-2 flex gap-4'>
        <input
          {...register("email")}
          type='text'
          className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
          placeholder='you@example.com'
        />
        <Button>Add</Button>
      </div>
      <p className='mt-1 text-sm text-red-600'>{errors.email?.message}</p>
      {showSuccessState && (
        <p className='mt-1 text-sm text-green-600'>
          Friend request sent successfully
        </p>
      )}
    </form>
  );
};

export default AddFriendButton;
