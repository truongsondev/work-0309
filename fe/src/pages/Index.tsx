import { useEffect, useMemo, useReducer } from "react";
import { ArrowLeft, MailCheck, ShieldCheck, Sparkles } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";
import SignUpForm from "@/components/auth/SignUpForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import OTPVerificationForm from "@/components/auth/OTPVerificationForm";

type AuthView = "login" | "signup" | "forgot" | "otp-register" | "otp-reset";

type State = {
  view: AuthView;
  email: string;
  otpOpen: boolean;
  otpMode: "register" | "reset";
};

type Action =
  | { type: "GO"; view: AuthView }
  | { type: "SET_EMAIL"; email: string }
  | { type: "OPEN_OTP"; mode: "register" | "reset" }
  | { type: "CLOSE_OTP" };

const initialState: State = {
  view: "login",
  email: "",
  otpOpen: false,
  otpMode: "register",
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "GO":
      return { ...state, view: action.view };
    case "SET_EMAIL":
      return { ...state, email: action.email };
    case "OPEN_OTP":
      return { ...state, otpOpen: true, otpMode: action.mode, view: action.mode === "register" ? "otp-register" : "otp-reset" };
    case "CLOSE_OTP":
      return { ...state, otpOpen: false, view: "login", email: "" };
    default:
      return state;
  }
}

/**
 * Small utility to compose class names
 */
function cx(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

export default function AuthIndex() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Optional: allow URL hash to jump to view (#/signup, #/forgot)
  useEffect(() => {
    const hash = window.location.hash.replace("#/", "");
    if (hash === "signup" || hash === "forgot" || hash === "login") {
      dispatch({ type: "GO", view: hash as AuthView });
    }
  }, []);

  // Dynamic header based on primary views
  const header = useMemo(() => {
    switch (state.view) {
      case "login":
        return { title: "Chào mừng trở lại", subtitle: "Đăng nhập để tiếp tục hành trình của bạn." };
      case "signup":
        return { title: "Tạo tài khoản mới", subtitle: "Chỉ mất một phút để bắt đầu." };
      case "forgot":
        return { title: "Quên mật khẩu", subtitle: "Nhập email để nhận mã xác thực." };
      case "otp-register":
        return { title: "Xác thực tài khoản", subtitle: `Nhập mã OTP đã gửi tới ${state.email}` };
      case "otp-reset":
        return { title: "Xác thực đặt lại mật khẩu", subtitle: `Nhập mã OTP đã gửi tới ${state.email}` };
      default:
        return { title: "", subtitle: "" };
    }
  }, [state.view, state.email]);

  return (
    <div className="min-h-screen flex justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50">

      {/* Right form card */}
      <main className="flex items-center justify-center p-6 sm:p-10">
         <div className="w-[420px] sm:w-[460px]">
          {/* Tabs (Login / Sign up). Hide on secondary flows */}
          {["login", "signup"].includes(state.view) && (
            <div className="mb-6 inline-flex rounded-xl bg-slate-100 p-1">
              <button
                onClick={() => dispatch({ type: "GO", view: "login" })}
                className={cx(
                  "px-4 py-2 rounded-lg text-sm font-medium transition",
                  state.view === "login" ? "bg-white shadow text-slate-900" : "text-slate-600 hover:text-slate-900"
                )}
              >
                Đăng nhập
              </button>
              <button
                onClick={() => dispatch({ type: "GO", view: "signup" })}
                className={cx(
                  "px-4 py-2 rounded-lg text-sm font-medium transition",
                  state.view === "signup" ? "bg-white shadow text-slate-900" : "text-slate-600 hover:text-slate-900"
                )}
              >
                Tạo tài khoản
              </button>
            </div>
          )}

          {/* Secondary header with back for Forgot/OTP */}
          {["forgot", "otp-register", "otp-reset"].includes(state.view) && (
            <button
              onClick={() => dispatch({ type: "GO", view: "login" })}
              className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="size-4" /> Quay lại
            </button>
          )}

          <div className="rounded-2xl border bg-white/80 backdrop-blur p-6 shadow-sm">
            <h2 className="text-xl font-bold">{header.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{header.subtitle}</p>

            <div className="mt-6">
              {state.view === "login" && (
                <LoginForm
                  onSwitchToSignUp={() => dispatch({ type: "GO", view: "signup" })}
                  onSwitchToForgotPassword={() => dispatch({ type: "GO", view: "forgot" })}
                  onLoginSuccess={() => {
                    // TODO: redirect to dashboard
                    console.log("Logged in");
                  }}
                />
              )}

              {state.view === "signup" && (
                <SignUpForm
                  onSwitchToLogin={() => dispatch({ type: "GO", view: "login" })}
                  onSwitchToForgotPassword={() => dispatch({ type: "GO", view: "forgot" })}
                  onSignUpSuccess={(email: string) => {
                    dispatch({ type: "SET_EMAIL", email });
                    dispatch({ type: "OPEN_OTP", mode: "register" });
                  }}
                />
              )}

              {state.view === "forgot" && (
                <ForgotPasswordForm
                  onSwitchToLogin={() => dispatch({ type: "GO", view: "login" })}
                  onSwitchToSignUp={() => dispatch({ type: "GO", view: "signup" })}
                  onEmailSent={(email: string) => {
                    dispatch({ type: "SET_EMAIL", email });
                    dispatch({ type: "OPEN_OTP", mode: "reset" });
                  }}
                />
              )}
            </div>

            {/* Footer help */}
            {state.view === "login" && (
              <p className="mt-6 text-xs text-slate-500">
                Khi đăng nhập, bạn đồng ý với Điều khoản & Chính sách bảo mật của chúng tôi.
              </p>
            )}
          </div>
        </div>
      </main>

      {/* OTP modal overlay (distinct UX vs. embedded view) */}
      {state.otpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-xl">
            <OTPVerificationForm
              title={state.otpMode === "register" ? "Xác thực tài khoản" : "Xác thực đặt lại mật khẩu"}
              subtitle="Nhập mã OTP đã gửi đến email:"
              email={state.email}
              mode={state.otpMode}
              onVerifySuccess={() => {
                // register → về login; reset → cũng về login
                dispatch({ type: "CLOSE_OTP" });
              }}
              onGoBack={() => {
                // Quay lại đúng flow trước đó
                if (state.otpMode === "register") {
                  dispatch({ type: "GO", view: "signup" });
                } else {
                  dispatch({ type: "GO", view: "forgot" });
                }
                dispatch({ type: "SET_EMAIL", email: state.email });
                // Không đóng modal bằng Back; đóng bằng X hoặc Verify success
              }}
            />
            <div className="mt-4 text-right">
              <button
                onClick={() => dispatch({ type: "CLOSE_OTP" })}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
