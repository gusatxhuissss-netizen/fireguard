import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Flame, LockKeyhole, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

type AuthMode = "register" | "login";

function GoogleMark() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5"><path fill="#4285F4" d="M21.35 12.27c0-.78-.07-1.53-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.15c1.84-1.7 2.9-4.2 2.9-7.42Z"/><path fill="#34A853" d="M12 21.7c2.63 0 4.84-.87 6.45-2.36l-3.15-2.45c-.87.58-1.98.92-3.3.92-2.54 0-4.7-1.72-5.47-4.03H3.27v2.53A9.74 9.74 0 0 0 12 21.7Z"/><path fill="#FBBC05" d="M6.53 13.78a5.86 5.86 0 0 1 0-3.56V7.69H3.27a9.74 9.74 0 0 0 0 8.62l3.26-2.53Z"/><path fill="#EA4335" d="M12 6.2c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.84 3.26 14.63 2.3 12 2.3a9.74 9.74 0 0 0-8.73 5.39l3.26 2.53C7.3 7.92 9.46 6.2 12 6.2Z"/></svg>;
}

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
  phone: string;
};

const initialRegisterForm: RegisterForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  birthDate: "",
  phone: "",
};

function AuthShell({ mode, children }: { mode: AuthMode; children: React.ReactNode }) {
  const isRegister = mode === "register";
  return <main className="relative min-h-screen overflow-hidden bg-[#10332d] px-4 py-8 text-[#f6f5e9] sm:px-6 lg:px-8"><div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(rgba(202,226,172,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(202,226,172,.12) 1px,transparent 1px)", backgroundSize: "44px 44px" }} /><div className="pointer-events-none absolute -right-40 top-16 h-96 w-96 rounded-full bg-[#d79642]/15 blur-3xl" /><div className="relative z-10 mx-auto max-w-6xl"><header className="flex items-center justify-between py-2"><Link href="/" className="inline-flex items-center gap-2 text-sm font-extrabold tracking-tight transition-opacity hover:opacity-80"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#b7d76b] text-[#173b35]"><Flame className="h-5 w-5" /></span>FireGuard</Link><Link href="/onboarding" className="inline-flex items-center gap-2 text-xs font-semibold text-[#c7d8cf] transition-colors hover:text-white"><ArrowLeft className="h-3.5 w-3.5" />Voltar</Link></header><div className="mx-auto grid max-w-5xl gap-8 pb-6 pt-10 lg:grid-cols-[.72fr_1.28fr] lg:items-start lg:gap-14 lg:pt-16"><div className="max-w-md lg:pt-8"><p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#cce47d]">{isRegister ? "Criar acesso" : "Acesso seguro"}</p><h1 className="mt-4 font-serif text-4xl leading-[1.06] tracking-tight sm:text-5xl">{isRegister ? "Pronto para proteger o que importa?" : "Bem-vindo de volta ao FireGuard."}</h1><p className="mt-6 text-sm leading-7 text-[#c7d8cf]">{isRegister ? "Crie seu perfil para registrar denúncias, acompanhar ocorrências e receber alertas do território." : "Entre para acompanhar riscos, denúncias e ações da sua operação ambiental."}</p><div className="mt-9 space-y-4 text-sm text-[#c5d8ce]"><div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#b7d76b]/15 text-[#d7e981]"><ShieldCheck className="h-4 w-4" /></span><span>Seus dados ficam protegidos com sessão segura.</span></div><div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#b7d76b]/15 text-[#d7e981]"><CheckCircle2 className="h-4 w-4" /></span><span>Sensores e drones continuam identificados como simulados no MVP.</span></div></div></div>{children}</div></div></main>;
}

function Field({ id, label, icon: Icon, ...props }: { id: string; label: string; icon: typeof UserRound } & React.ComponentProps<typeof Input>) {
  return <div className="space-y-2"><Label htmlFor={id} className="text-xs font-semibold text-[#315b4e]">{label}</Label><div className="relative"><Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7e9a8d]" /><Input id={id} {...props} className="h-11 rounded-xl border-[#d8e4d5] bg-white pl-10 text-[#173b35] placeholder:text-[#9aae9f] focus-visible:border-[#7a9e55] focus-visible:ring-[#b7d76b]/40" /></div></div>;
}

export function AuthPage({ mode }: { mode: AuthMode }) {
  const isRegister = mode === "register";
  const [form, setForm] = useState<RegisterForm>(initialRegisterForm);
  const [login, setLogin] = useState({ email: "", password: "" });
  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      toast.success("Conta criada com sucesso. Bem-vindo ao FireGuard!");
      window.location.href = "/dashboard";
    },
    onError: error => toast.error(error.message),
  });
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      toast.success("Login realizado com sucesso.");
      window.location.href = "/dashboard";
    },
    onError: error => toast.error(error.message),
  });

  const updateRegister = (key: keyof RegisterForm, value: string) => setForm(current => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (isRegister) {
      if (form.password !== form.confirmPassword) {
        toast.error("As senhas não coincidem.");
        return;
      }
      registerMutation.mutate(form);
    } else {
      loginMutation.mutate(login);
    }
  };
  const pending = registerMutation.isPending || loginMutation.isPending;

  return <AuthShell mode={mode}><section className="rounded-[1.75rem] bg-[#f7f7ef] p-6 text-[#173b35] shadow-2xl shadow-black/20 sm:p-8 lg:p-10"><div className="flex items-start justify-between gap-5"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[.18em] text-[#b06b2b]">{isRegister ? "Novo usuário" : "Área restrita"}</p><h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">{isRegister ? "Crie sua conta" : "Entrar na plataforma"}</h2></div><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e6efdc] text-[#366956]"><LockKeyhole className="h-5 w-5" /></span></div><form onSubmit={submit} className="mt-8 space-y-5" noValidate><Button type="button" onClick={startLogin} className="h-12 w-full rounded-xl border border-[#cfded0] bg-white font-bold text-[#173b35] shadow-sm hover:bg-[#f0f5ec]"><GoogleMark />Continuar com o Google</Button><div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.15em] text-[#8aa095]"><span className="h-px flex-1 bg-[#dce7d9]" /><span>ou use seu e-mail</span><span className="h-px flex-1 bg-[#dce7d9]" /></div>{isRegister ? <><Field id="name" label="Nome completo" icon={UserRound} type="text" autoComplete="name" required placeholder="Ex.: Ana Martins" value={form.name} onChange={event => updateRegister("name", event.target.value)} /><div className="grid gap-5 sm:grid-cols-2"><Field id="birthDate" label="Data de nascimento" icon={CalendarDays} type="date" autoComplete="bday" required value={form.birthDate} onChange={event => updateRegister("birthDate", event.target.value)} /><Field id="phone" label="Telefone" icon={Phone} type="tel" autoComplete="tel" required placeholder="(00) 00000-0000" value={form.phone} onChange={event => updateRegister("phone", event.target.value)} /></div><Field id="register-email" label="E-mail" icon={Mail} type="email" autoComplete="email" required placeholder="voce@exemplo.com" value={form.email} onChange={event => updateRegister("email", event.target.value)} /><div className="grid gap-5 sm:grid-cols-2"><Field id="password" label="Senha" icon={LockKeyhole} type="password" autoComplete="new-password" required placeholder="Mínimo de 8 caracteres" value={form.password} onChange={event => updateRegister("password", event.target.value)} /><Field id="confirmPassword" label="Confirmar senha" icon={LockKeyhole} type="password" autoComplete="new-password" required placeholder="Repita sua senha" value={form.confirmPassword} onChange={event => updateRegister("confirmPassword", event.target.value)} /></div><p className="text-[11px] leading-5 text-[#71877e]">A senha é protegida com hash seguro e nunca é armazenada em texto puro.</p></> : <><Field id="login-email" label="E-mail" icon={Mail} type="email" autoComplete="email" required placeholder="voce@exemplo.com" value={login.email} onChange={event => setLogin(current => ({ ...current, email: event.target.value }))} /><Field id="login-password" label="Senha" icon={LockKeyhole} type="password" autoComplete="current-password" required placeholder="Digite sua senha" value={login.password} onChange={event => setLogin(current => ({ ...current, password: event.target.value }))} /></>}<Button type="submit" disabled={pending} className="h-12 w-full rounded-xl bg-[#1c4a3d] font-bold text-white shadow-lg shadow-[#1c4a3d]/15 hover:bg-[#10332d]">{pending ? "Aguarde…" : isRegister ? "Criar conta e entrar" : "Entrar no FireGuard"}<ArrowRight className="ml-2 h-4 w-4" /></Button></form><div className="mt-7 border-t border-[#dce7d9] pt-6 text-center text-sm text-[#71877e]">{isRegister ? <>Já possui uma conta? <Link href="/login" className="font-bold text-[#356854] hover:underline">Entrar com e-mail</Link></> : <>Ainda não possui uma conta? <Link href="/register" className="font-bold text-[#356854] hover:underline">Criar cadastro</Link></>}</div></section></AuthShell>;
}

export function Register() { return <AuthPage mode="register" />; }
export function Login() { return <AuthPage mode="login" />; }
