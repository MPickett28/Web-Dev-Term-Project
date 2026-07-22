import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";

const API_BASE_URL = "http://localhost:5000";

const initialForm = {
  displayName: "",
  email: "",
  password: "",
  confirmPassword: "",
  remember: false
};

const initialAccountForm = {
  firstName: "",
  lastName: "",
  email: "",
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
};

async function readResponse(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function Login({ notice = "", onViewOrders }) {
  const {
    user,
    token,
    isLoggedIn,
    login,
    logout,
    updateUser
  } = useContext(AuthContext);

  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountForm, setAccountForm] = useState(initialAccountForm);
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountMessage, setAccountMessage] = useState(null);

  const isRegistering = mode === "register";

  useEffect(() => {
    if (!isLoggedIn && notice) {
      setMode("login");
      setMessage(notice);
    }
  }, [isLoggedIn, notice]);

  useEffect(() => {
    if (!isLoggedIn || !token) {
      return undefined;
    }

    let cancelled = false;

    async function loadAccount() {
      setAccountLoading(true);
      setAccountMessage(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await readResponse(response);

        if (response.status === 401) {
          if (!cancelled) {
            logout();
            setMessage("Your session expired. Please log in again.");
          }
          return;
        }

        if (!response.ok) {
          throw new Error(data.message || "Unable to load your account.");
        }

        if (!cancelled) {
          updateUser(data.user);
          setAccountForm({
            firstName: data.user.firstName || "",
            lastName: data.user.lastName || "",
            email: data.user.email || "",
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
          });
        }
      } catch (error) {
        if (!cancelled) {
          const text =
            error instanceof TypeError
              ? "Unable to connect to the account server. Please make sure the backend is running."
              : error.message || "Unable to load your account.";

          setAccountMessage({ type: "error", text });
        }
      } finally {
        if (!cancelled) {
          setAccountLoading(false);
        }
      }
    }

    loadAccount();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, token, logout, updateUser]);

  const updateField = (event) => {
    const { name, value, checked, type } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
    setMessage("");
  };

  const updateAccountField = (event) => {
    const { name, value } = event.target;

    setAccountForm((current) => ({
      ...current,
      [name]: value
    }));
    setAccountMessage(null);
  };

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setForm(initialForm);
    setMessage("");
    setIsSubmitting(false);
  };

  const handleRegister = async () => {
    if (form.password !== form.confirmPassword) {
      throw new Error("The passwords do not match.");
    }

    const nameParts = form.displayName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ");

    if (!firstName || !lastName) {
      throw new Error("Please enter both your first and last name.");
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email: form.email.trim().toLowerCase(),
        password: form.password,
        confirmPassword: form.confirmPassword
      })
    });
    const data = await readResponse(response);

    if (!response.ok) {
      throw new Error(data.message || "Registration failed.");
    }

    setForm(initialForm);
    setMessage("Account created successfully. You can now log in.");

    setTimeout(() => {
      setMode("login");
    }, 1500);
  };

  const handleLogin = async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: form.email.trim().toLowerCase(),
        password: form.password
      })
    });
    const data = await readResponse(response);

    if (!response.ok) {
      throw new Error(data.message || "Login failed.");
    }

    login(data.user, data.token, form.remember);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      if (isRegistering) {
        await handleRegister();
      } else {
        await handleLogin();
      }
    } catch (error) {
      setMessage(
        error instanceof TypeError
          ? "Unable to connect to the account server."
          : error.message || "Something went wrong."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccountSave = async (event) => {
    event.preventDefault();
    setAccountMessage(null);

    const firstName = accountForm.firstName.trim();
    const lastName = accountForm.lastName.trim();

    if (!firstName || !lastName) {
      setAccountMessage({
        type: "error",
        text: "First name and last name are required."
      });
      return;
    }

    if (accountForm.newPassword) {
      if (!accountForm.currentPassword) {
        setAccountMessage({
          type: "error",
          text: "Enter your current password to choose a new password."
        });
        return;
      }

      if (accountForm.newPassword.length < 8) {
        setAccountMessage({
          type: "error",
          text: "The new password must be at least 8 characters long."
        });
        return;
      }

      if (accountForm.newPassword !== accountForm.confirmPassword) {
        setAccountMessage({
          type: "error",
          text: "The new passwords do not match."
        });
        return;
      }
    } else if (accountForm.currentPassword || accountForm.confirmPassword) {
      setAccountMessage({
        type: "error",
        text: "Enter a new password to complete the password change."
      });
      return;
    }

    setAccountSaving(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName,
          lastName,
          currentPassword: accountForm.currentPassword,
          newPassword: accountForm.newPassword,
          confirmPassword: accountForm.confirmPassword
        })
      });
      const data = await readResponse(response);

      if (response.status === 401 && /token|authentication/i.test(data.message || "")) {
        logout();
        setMessage("Your session expired. Please log in again.");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to save your account.");
      }

      updateUser(data.user);
      setAccountForm({
        firstName: data.user.firstName || "",
        lastName: data.user.lastName || "",
        email: data.user.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setAccountMessage({
        type: "success",
        text: "Your account has been updated successfully."
      });
    } catch (error) {
      const text =
        error instanceof TypeError
          ? "Unable to connect to the account server. Please try again."
          : error.message || "Unable to save your account.";

      setAccountMessage({ type: "error", text });
    } finally {
      setAccountSaving(false);
    }
  };

  if (isLoggedIn) {
    return (
      <main className="account-page">
        <section className="account-panel account-panel-edit" aria-labelledby="account-title">
          <div className="account-intro">
            <p className="account-eyebrow">HERO PROFILE</p>
            <h1 id="account-title">Welcome, {user?.firstName}</h1>
            <p>
              Keep your hero profile current and your account protected before
              heading back into the Arsenal.
            </p>
          </div>

          <div className="account-form-card account-profile-card">
            <div className="account-card-heading">
              <div>
                <p className="account-eyebrow">ACCOUNT SETTINGS</p>
                <h2>My Account</h2>
              </div>
              <div className="account-header-actions">
                <button
                  type="button"
                  className="account-orders-button"
                  onClick={onViewOrders}
                >
                  Purchase History
                </button>
                <button type="button" className="account-logout-button" onClick={logout}>
                  Logout
                </button>
              </div>
            </div>

            {accountLoading ? (
              <div className="account-status-panel" role="status">
                Loading your hero profile...
              </div>
            ) : (
              <form className="account-form" onSubmit={handleAccountSave}>
                <div className="account-name-fields">
                  <label>
                    First Name
                    <input
                      type="text"
                      name="firstName"
                      value={accountForm.firstName}
                      onChange={updateAccountField}
                      autoComplete="given-name"
                      disabled={accountSaving}
                      required
                    />
                  </label>

                  <label>
                    Last Name
                    <input
                      type="text"
                      name="lastName"
                      value={accountForm.lastName}
                      onChange={updateAccountField}
                      autoComplete="family-name"
                      disabled={accountSaving}
                      required
                    />
                  </label>
                </div>

                <label>
                  Email Address
                  <input
                    type="email"
                    value={accountForm.email}
                    readOnly
                    aria-readonly="true"
                    className="account-readonly-input"
                  />
                  <span className="account-field-hint">
                    Email changes are not available yet.
                  </span>
                </label>

                <section className="account-password-section" aria-labelledby="password-heading">
                  <div>
                    <h3 id="password-heading">Change Password</h3>
                    <p>Optional — leave these fields empty to keep your current password.</p>
                  </div>

                  <label>
                    Current Password
                    <input
                      type="password"
                      name="currentPassword"
                      value={accountForm.currentPassword}
                      onChange={updateAccountField}
                      autoComplete="current-password"
                      disabled={accountSaving}
                    />
                  </label>

                  <label>
                    New Password
                    <input
                      type="password"
                      name="newPassword"
                      value={accountForm.newPassword}
                      onChange={updateAccountField}
                      autoComplete="new-password"
                      minLength={8}
                      disabled={accountSaving}
                    />
                  </label>

                  <label>
                    Confirm New Password
                    <input
                      type="password"
                      name="confirmPassword"
                      value={accountForm.confirmPassword}
                      onChange={updateAccountField}
                      autoComplete="new-password"
                      minLength={8}
                      disabled={accountSaving}
                    />
                  </label>
                </section>

                {accountMessage && (
                  <p
                    className={`account-message account-message-${accountMessage.type}`}
                    role="status"
                    aria-live="polite"
                  >
                    {accountMessage.text}
                  </p>
                )}

                <button
                  type="submit"
                  className="account-submit-button"
                  disabled={accountSaving}
                >
                  {accountSaving ? "Saving Changes..." : "Save Changes"}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="account-page">
      <section className="account-panel" aria-labelledby="account-title">
        <div className="account-intro">
          <p className="account-eyebrow">MEMBER ACCESS</p>
          <h1 id="account-title">
            {isRegistering ? "Join the Arsenal" : "Welcome Back, Hero"}
          </h1>
          <p>
            {isRegistering
              ? "Create your hero profile and prepare for your next adventure."
              : "Sign in to manage your orders and continue building your legendary loadout."}
          </p>
        </div>

        <div className="account-form-card">
          <div className="account-tabs" role="tablist" aria-label="Account options">
            <button
              type="button"
              role="tab"
              aria-selected={!isRegistering}
              className={!isRegistering ? "active" : ""}
              onClick={() => changeMode("login")}
            >
              Login
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isRegistering}
              className={isRegistering ? "active" : ""}
              onClick={() => changeMode("register")}
            >
              Register
            </button>
          </div>

          <form className="account-form" onSubmit={handleSubmit}>
            {isRegistering && (
              <label>
                Full Name
                <input
                  type="text"
                  name="displayName"
                  value={form.displayName}
                  onChange={updateField}
                  placeholder="Enter your first and last name"
                  autoComplete="name"
                  required
                />
              </label>
            )}

            <label>
              Email Address
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={updateField}
                placeholder="hero@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={updateField}
                placeholder="Enter your password"
                autoComplete={isRegistering ? "new-password" : "current-password"}
                minLength={8}
                required
              />
            </label>

            {isRegistering && (
              <label>
                Confirm Password
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={updateField}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </label>
            )}

            {!isRegistering && (
              <div className="account-form-options">
                <label className="remember-option">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={form.remember}
                    onChange={updateField}
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  className="account-text-button"
                  onClick={() => setMessage("Password recovery will be added later.")}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {message && (
              <p className="account-message" role="status">
                {message}
              </p>
            )}

            <button
              type="submit"
              className="account-submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? isRegistering
                  ? "Creating Account..."
                  : "Entering the Arsenal..."
                : isRegistering
                  ? "Create Account"
                  : "Enter the Arsenal"}
            </button>
          </form>

          <p className="account-demo-note">
            Create an account to save your profile and order history.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;
