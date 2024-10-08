import React, { useState } from "react";
import {
  useSignInWithEmailAndPassword,
  useSignInWithGoogle,
} from "react-firebase-hooks/auth";
import { auth } from "../services/firebase";
import { FcGoogle } from "react-icons/fc";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signInWithEmailAndPassword, user, loading, error] =
    useSignInWithEmailAndPassword(auth);
  const [signInWithGoogle, googleUser, googleLoading, googleError] =
    useSignInWithGoogle(auth);

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    signInWithEmailAndPassword(email, password);
  };

  const handleGoogleLogin = () => {
    signInWithGoogle();
  };

  if (loading || googleLoading) {
    return <div className="text-center text-white">加载中...</div>;
  }

  return (
    <div className="bg-white bg-opacity-90 p-8 rounded-xl shadow-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        雅思练习
      </h1>
      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            电子邮箱
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="请输入您的电子邮箱"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            密码
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="请输入您的密码"
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          登录
        </button>
      </form>
      <div className="mt-6">
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <FcGoogle className="mr-2" size={20} />
          使用谷歌账号登录
        </button>
      </div>
      {(error || googleError) && (
        <p className="mt-4 text-sm text-red-600 text-center">
          {error?.message ? "登录失败，请检查您的邮箱和密码。" : ""}
          {googleError?.message ? "谷歌登录失败，请稍后重试。" : ""}
        </p>
      )}
    </div>
  );
};

export default LoginForm;
