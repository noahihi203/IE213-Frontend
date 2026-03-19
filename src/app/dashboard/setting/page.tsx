"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Save,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  FileText,
  ImageIcon,
  Loader,
  Check,
  X,
  Settings,
  LogOut,
  Users,
  Tags,
  Folder,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { userService } from "@/lib/api/user.service";
import { User as UserType } from "@/lib/types";

type SettingTab = "profile" | "email" | "password";

interface FormErrors {
  [key: string]: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, authInitialized } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SettingTab>("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    username: "",
    bio: "",
    avatar: "",
  });

  // Email Form State
  const [emailForm, setEmailForm] = useState({
    currentPassword: "",
    newEmail: "",
    confirmEmail: "",
  });

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [isDirty, setIsDirty] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || "",
        username: user.username || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  // Validation Functions
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateUsername = (username: string) => {
    return /^[a-zA-Z0-9_]{3,20}$/.test(username);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Handle Profile Changes
  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
    if (name === "avatar") setAvatarError(false); // Reset image error on change
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle Profile Submit
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: FormErrors = {};

    if (!profileForm.fullName.trim()) {
      errors.fullName = "Full name is required";
    }
    if (!profileForm.username.trim()) {
      errors.username = "Username is required";
    } else if (!validateUsername(profileForm.username)) {
      errors.username =
        "Username must be 3-20 characters (letters, numbers, underscore only)";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const updateData: Partial<UserType> = {
        fullName: profileForm.fullName.trim(),
        bio: profileForm.bio.trim(),
        // Send actual string or empty string to be handled by backend Zod
        avatar: profileForm.avatar.trim(),
      };

      await userService.updateUserProfile(updateData);

      if (profileForm.username.trim() !== user?.username) {
        await userService.updateUserUsername(profileForm.username.trim());
      }

      setMessage({
        type: "success",
        text: "Profile updated successfully!",
      });
      setIsDirty(false);

      if (user?._id) {
        try {
          const updatedUserResponse = await userService.getUserProfile(user._id);
          if (updatedUserResponse.metadata) {
            if (typeof window !== "undefined") {
              localStorage.setItem(
                "user",
                JSON.stringify(updatedUserResponse.metadata)
              );
            }
            useAuthStore.setState({ user: updatedUserResponse.metadata });
          }
        } catch (error) {
          useAuthStore.getState().checkAuth();
        }
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to update profile",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Email Submit
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: FormErrors = {};

    if (!emailForm.currentPassword) errors.currentPassword = "Current password is required";
    if (!emailForm.newEmail) errors.newEmail = "New email is required";
    else if (!validateEmail(emailForm.newEmail)) errors.newEmail = "Please enter a valid email";
    if (emailForm.newEmail !== emailForm.confirmEmail) errors.confirmEmail = "Emails do not match";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      await userService.updateUserEmail(
        emailForm.newEmail,
        emailForm.currentPassword
      );

      setMessage({
        type: "success",
        text: "Email updated successfully!",
      });
      setEmailForm({ currentPassword: "", newEmail: "", confirmEmail: "" });
      setFormErrors({});

      if (user?._id) {
        try {
          const updatedUserResponse = await userService.getUserProfile(user._id);
          if (updatedUserResponse.metadata) {
            if (typeof window !== "undefined") {
              localStorage.setItem(
                "user",
                JSON.stringify(updatedUserResponse.metadata)
              );
            }
            useAuthStore.setState({ user: updatedUserResponse.metadata });
          }
        } catch (error) {
          useAuthStore.getState().checkAuth();
        }
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to update email (password may be incorrect)",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Password Submit
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: FormErrors = {};

    if (!passwordForm.currentPassword) errors.currentPassword = "Current password is required";
    if (!passwordForm.newPassword) errors.newPassword = "New password is required";
    else if (!validatePassword(passwordForm.newPassword)) errors.newPassword = "Password must be at least 8 characters";
    if (passwordForm.newPassword !== passwordForm.confirmPassword) errors.confirmPassword = "Passwords do not match";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      await userService.updateUserPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setMessage({
        type: "success",
        text: "Password successfully updated! You may be logged out of other devices.",
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setFormErrors({});
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to update password. Please check your current password.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!authInitialized) return <div className="min-h-screen bg-gray-50" />;

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">
            Please log in to access settings
          </h2>
        </div>
      </div>
    );
  }

  // Sidebar Navigation Items (Matching Dashboard)
  const navItems = [
    { href: "/dashboard", icon: <FileText className="w-5 h-5" />, label: "Bài viết của tôi" },
    { href: "/dashboard?tab=users", icon: <Users className="w-5 h-5" />, label: "Quản lý người dùng", adminOnly: true },
    { href: "/dashboard?tab=tags", icon: <Tags className="w-5 h-5" />, label: "Quản lý tag", adminOnly: true },
    { href: "/dashboard?tab=categories", icon: <Folder className="w-5 h-5" />, label: "Quản lý danh mục", adminOnly: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* ── Sidebar (Matches Dashboard Layout) ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-20">
              <div className="text-center mb-6">
                {user.avatar && !avatarError ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    onError={() => setAvatarError(true)}
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 border-gray-100 shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 text-white text-2xl font-bold shadow-sm">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <h2 className="text-xl font-bold text-gray-900">{user.fullName}</h2>
                <p className="text-gray-500 text-sm">@{user.username}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wider">
                  {user.role}
                </span>
              </div>

              <nav className="space-y-1.5">
                {navItems
                  .filter((item) => !item.adminOnly || user.role === "admin")
                  .map(({ href, icon, label }) => (
                    <Link
                      key={label}
                      href={href}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      {icon}
                      <span>{label}</span>
                    </Link>
                  ))}

                <div className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg font-medium bg-blue-50 text-blue-700 transition-colors">
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 mt-2 hover:bg-red-50 text-red-600 rounded-lg font-medium transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </div>

          {/* ── Main Content (Settings Cards) ── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              
              {/* Header & Horizontal Tabs */}
              <div className="px-6 pt-6 border-b border-gray-100">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>
                <div className="flex space-x-6">
                  {(
                    [
                      { id: "profile", label: "Profile", icon: User },
                      { id: "email", label: "Email", icon: Mail },
                      { id: "password", label: "Security", icon: Lock },
                    ] as const
                  ).map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => {
                        setActiveTab(id);
                        setFormErrors({});
                        setMessage(null);
                      }}
                      className={`pb-4 px-1 flex items-center space-x-2 font-medium text-sm transition-all border-b-2 ${
                        activeTab === id
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {/* Global Message Alert */}
                {message && (
                  <div
                    className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${
                      message.type === "success"
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    {message.type === "success" ? (
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <p
                      className={`text-sm font-medium ${
                        message.type === "success" ? "text-green-800" : "text-red-800"
                      }`}
                    >
                      {message.text}
                    </p>
                  </div>
                )}

                {/* ── PROFILE TAB ── */}
                {activeTab === "profile" && (
                  <div className="max-w-2xl animate-in fade-in duration-300">
                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                      
                      {/* Interactive Avatar Preview Input */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                          Profile Picture
                        </label>
                        <div className="flex items-start space-x-5">
                          <div className="flex-shrink-0">
                            {profileForm.avatar && !avatarError ? (
                              <img
                                src={profileForm.avatar}
                                alt="Avatar preview"
                                onError={() => setAvatarError(true)}
                                className="h-20 w-20 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                              />
                            ) : (
                              <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-blue-500 to-blue-700 flex items-center justify-center text-white text-3xl font-bold shadow-sm">
                                {profileForm.fullName?.charAt(0)?.toUpperCase() || "U"}
                              </div>
                            )}
                          </div>
                          <div className="flex-grow">
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <ImageIcon className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                                type="url"
                                name="avatar"
                                value={profileForm.avatar}
                                onChange={handleProfileChange}
                                className="pl-10 w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                placeholder="https://example.com/your-avatar.jpg"
                              />
                            </div>
                            <p className="text-gray-500 text-xs mt-2">
                              Provide a direct URL to an image. Leave blank to use your initials.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            name="fullName"
                            value={profileForm.fullName}
                            onChange={handleProfileChange}
                            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all ${
                              formErrors.fullName ? "border-red-500" : "border-gray-200"
                            }`}
                            placeholder="Enter your full name"
                          />
                          {formErrors.fullName && (
                            <p className="text-red-500 text-xs mt-1.5 font-medium">{formErrors.fullName}</p>
                          )}
                        </div>

                        {/* Username */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Username
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 select-none">
                              @
                            </span>
                            <input
                              type="text"
                              name="username"
                              value={profileForm.username}
                              onChange={handleProfileChange}
                              className={`pl-8 w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all ${
                                formErrors.username ? "border-red-500" : "border-gray-200"
                              }`}
                              placeholder="username"
                            />
                          </div>
                          {formErrors.username ? (
                            <p className="text-red-500 text-xs mt-1.5 font-medium">{formErrors.username}</p>
                          ) : (
                            <p className="text-gray-500 text-xs mt-1.5">Letters, numbers, and underscores only</p>
                          )}
                        </div>
                      </div>

                      {/* Bio */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Bio
                        </label>
                        <textarea
                          name="bio"
                          value={profileForm.bio}
                          onChange={handleProfileChange}
                          rows={4}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
                          placeholder="Tell us a little bit about yourself..."
                        />
                        <div className="flex justify-between items-center mt-1.5">
                          <p className="text-gray-500 text-xs">Brief description for your profile.</p>
                          <p className={`text-xs ${profileForm.bio.length > 500 ? 'text-red-500' : 'text-gray-400'}`}>
                            {profileForm.bio.length}/500
                          </p>
                        </div>
                      </div>

                      {/* Submit Profile */}
                      <div className="pt-4 flex justify-end space-x-3">
                        <button
                          type="submit"
                          disabled={isLoading || !isDirty}
                          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 font-medium flex items-center space-x-2 transition-colors shadow-sm"
                        >
                          {isLoading ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          <span>Save Profile</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* ── EMAIL TAB ── */}
                {activeTab === "email" && (
                  <div className="max-w-md animate-in fade-in duration-300">
                    <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 mb-6">
                      <p className="text-sm text-gray-600">Current email address</p>
                      <p className="text-base font-semibold text-gray-900">{user.email}</p>
                    </div>

                    <form onSubmit={handleEmailSubmit} className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">New Email</label>
                        <input
                          type="email"
                          value={emailForm.newEmail}
                          onChange={(e) => {
                            setEmailForm((prev) => ({ ...prev, newEmail: e.target.value }));
                            if (formErrors.newEmail) setFormErrors((prev) => ({ ...prev, newEmail: "" }));
                          }}
                          className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all ${
                            formErrors.newEmail ? "border-red-500" : "border-gray-200"
                          }`}
                        />
                        {formErrors.newEmail && <p className="text-red-500 text-xs mt-1.5 font-medium">{formErrors.newEmail}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Confirm New Email</label>
                        <input
                          type="email"
                          value={emailForm.confirmEmail}
                          onChange={(e) => {
                            setEmailForm((prev) => ({ ...prev, confirmEmail: e.target.value }));
                            if (formErrors.confirmEmail) setFormErrors((prev) => ({ ...prev, confirmEmail: "" }));
                          }}
                          className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all ${
                            formErrors.confirmEmail ? "border-red-500" : "border-gray-200"
                          }`}
                        />
                        {formErrors.confirmEmail && <p className="text-red-500 text-xs mt-1.5 font-medium">{formErrors.confirmEmail}</p>}
                      </div>

                      <div className="pt-2">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Current Password</label>
                        <input
                          type="password"
                          value={emailForm.currentPassword}
                          onChange={(e) => {
                            setEmailForm((prev) => ({ ...prev, currentPassword: e.target.value }));
                            if (formErrors.currentPassword) setFormErrors((prev) => ({ ...prev, currentPassword: "" }));
                          }}
                          className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all ${
                            formErrors.currentPassword ? "border-red-500" : "border-gray-200"
                          }`}
                        />
                        {formErrors.currentPassword ? (
                          <p className="text-red-500 text-xs mt-1.5 font-medium">{formErrors.currentPassword}</p>
                        ) : (
                          <p className="text-gray-500 text-xs mt-1.5">Required to authorize this change</p>
                        )}
                      </div>

                      <div className="pt-4">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 font-medium flex items-center justify-center space-x-2 transition-colors shadow-sm"
                        >
                          {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                          <span>Update Email Address</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* ── PASSWORD TAB ── */}
                {activeTab === "password" && (
                  <div className="max-w-md animate-in fade-in duration-300">
                    <form onSubmit={handlePasswordSubmit} className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Current Password</label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? "text" : "password"}
                            value={passwordForm.currentPassword}
                            onChange={(e) => {
                              setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }));
                              if (formErrors.currentPassword) setFormErrors((prev) => ({ ...prev, currentPassword: "" }));
                            }}
                            className={`w-full px-4 py-2.5 pr-10 bg-gray-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all ${
                              formErrors.currentPassword ? "border-red-500" : "border-gray-200"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {formErrors.currentPassword && <p className="text-red-500 text-xs mt-1.5 font-medium">{formErrors.currentPassword}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">New Password</label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? "text" : "password"}
                            value={passwordForm.newPassword}
                            onChange={(e) => {
                              setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }));
                              if (formErrors.newPassword) setFormErrors((prev) => ({ ...prev, newPassword: "" }));
                            }}
                            className={`w-full px-4 py-2.5 pr-10 bg-gray-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all ${
                              formErrors.newPassword ? "border-red-500" : "border-gray-200"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {formErrors.newPassword ? (
                           <p className="text-red-500 text-xs mt-1.5 font-medium">{formErrors.newPassword}</p>
                        ) : (
                           <p className="text-gray-500 text-xs mt-1.5">Must be at least 8 characters long.</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Confirm New Password</label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? "text" : "password"}
                            value={passwordForm.confirmPassword}
                            onChange={(e) => {
                              setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }));
                              if (formErrors.confirmPassword) setFormErrors((prev) => ({ ...prev, confirmPassword: "" }));
                            }}
                            className={`w-full px-4 py-2.5 pr-10 bg-gray-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all ${
                              formErrors.confirmPassword ? "border-red-500" : "border-gray-200"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {formErrors.confirmPassword && <p className="text-red-500 text-xs mt-1.5 font-medium">{formErrors.confirmPassword}</p>}
                      </div>

                      <div className="pt-4">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 font-medium flex items-center justify-center space-x-2 transition-colors shadow-sm"
                        >
                          {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                          <span>Update Security Details</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}