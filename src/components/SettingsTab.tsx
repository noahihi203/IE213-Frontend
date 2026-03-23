"use client";

import { useState } from "react";
import { User } from "@/lib/types";
import {
  userService,
  UpdateEmailPayload,
  UpdateProfilePayload,
  UpdateUsernamePayload,
} from "@/lib/api/user.service";
import { useAuthStore } from "@/store/authStore";

interface SettingsTabProps {
  user: User;
}

export default function SettingsTab({ user }: SettingsTabProps) {
  const [profileForm, setProfileForm] = useState<UpdateProfilePayload>({
    fullName: user.fullName || "",
    bio: user.bio || "",
    avatar: user.avatar || "",
  });
  const [emailForm, setEmailForm] = useState<UpdateEmailPayload>({
    newEmail: user.email || "",
    currentPassword: "",
  });
  const [usernameForm, setUsernameForm] = useState<UpdateUsernamePayload>({
    newUsername: user.username || "",
  });

  const [profileMessage, setProfileMessage] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);

  const handleProfileSubmit = async () => {
    try {
      setIsUpdatingProfile(true);
      setProfileMessage("");
      const response = await userService.updateUserProfile(profileForm);

      const nextUser: User = {
        ...user,
        ...response.metadata,
      };
      localStorage.setItem("user", JSON.stringify(nextUser));
      useAuthStore.setState({ user: nextUser });

      setProfileMessage("Cập nhật thông tin cơ bản thành công.");
    } catch (err: any) {
      setProfileMessage(err?.message || "Không thể cập nhật thông tin cơ bản.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleEmailSubmit = async () => {
    try {
      setIsUpdatingEmail(true);
      setEmailMessage("");
      const response = await userService.updateUserEmail(emailForm);

      const nextEmail = response.metadata?.email || emailForm.newEmail;
      const nextUser: User = {
        ...user,
        email: nextEmail,
      };
      localStorage.setItem("user", JSON.stringify(nextUser));
      useAuthStore.setState({ user: nextUser });

      setEmailForm((prev) => ({ ...prev, currentPassword: "" }));
      setEmailMessage("Cập nhật email thành công.");
    } catch (err: any) {
      setEmailMessage(err?.message || "Không thể cập nhật email.");
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleUsernameSubmit = async () => {
    try {
      setIsUpdatingUsername(true);
      setUsernameMessage("");
      const response = await userService.updateUserUsername(usernameForm);

      const nextUsername =
        response.metadata?.username || usernameForm.newUsername;
      const nextUser: User = {
        ...user,
        username: nextUsername,
      };
      localStorage.setItem("user", JSON.stringify(nextUser));
      useAuthStore.setState({ user: nextUser });

      setUsernameMessage("Cập nhật username thành công.");
    } catch (err: any) {
      setUsernameMessage(err?.message || "Không thể cập nhật username.");
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="mt-1 text-slate-600">
          Cập nhật thông tin tài khoản của bạn
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 p-4 md:p-5">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Thông tin cơ bản
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Họ và tên
            </label>
            <input
              type="text"
              value={profileForm.fullName}
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  fullName: e.target.value,
                }))
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Avatar URL
            </label>
            <input
              type="url"
              value={profileForm.avatar}
              onChange={(e) =>
                setProfileForm((prev) => ({ ...prev, avatar: e.target.value }))
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Bio
            </label>
            <textarea
              rows={4}
              value={profileForm.bio}
              onChange={(e) =>
                setProfileForm((prev) => ({ ...prev, bio: e.target.value }))
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {profileMessage && (
          <p className="mt-3 text-sm text-slate-600">{profileMessage}</p>
        )}

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => void handleProfileSubmit()}
            disabled={isUpdatingProfile}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {isUpdatingProfile ? "Đang cập nhật..." : "Lưu thông tin"}
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 p-4 md:p-5">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Đổi email</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email mới
            </label>
            <input
              type="email"
              value={emailForm.newEmail}
              onChange={(e) =>
                setEmailForm((prev) => ({ ...prev, newEmail: e.target.value }))
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Mật khẩu hiện tại (xác thực)
            </label>
            <input
              type="password"
              value={emailForm.currentPassword}
              onChange={(e) =>
                setEmailForm((prev) => ({
                  ...prev,
                  currentPassword: e.target.value,
                }))
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {emailMessage && (
          <p className="mt-3 text-sm text-slate-600">{emailMessage}</p>
        )}

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => void handleEmailSubmit()}
            disabled={isUpdatingEmail}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {isUpdatingEmail ? "Đang cập nhật..." : "Cập nhật email"}
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 p-4 md:p-5">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Đổi username
        </h2>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Username mới
          </label>
          <input
            type="text"
            value={usernameForm.newUsername}
            onChange={(e) =>
              setUsernameForm((prev) => ({
                ...prev,
                newUsername: e.target.value,
              }))
            }
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {usernameMessage && (
          <p className="mt-3 text-sm text-slate-600">{usernameMessage}</p>
        )}

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => void handleUsernameSubmit()}
            disabled={isUpdatingUsername}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {isUpdatingUsername ? "Đang cập nhật..." : "Cập nhật username"}
          </button>
        </div>
      </section>
    </div>
  );
}
