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

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
  phone: string;
};

const initialRegisterForm: RegisterForm = { name: "", email: "", password: "", confirmPassword: "", birthDate: "", phone: "" };

function GoogleMark() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5"><path fill="#4285F4" d="M21.35 12.27c0-.78-.07-1.53-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.15c1.84-1.7 2.9-4.2 2.9-7.42Z"/><path fill="#34A853" d="M12 21.7c2.63 0 4.84-.87 6.45-2.36l-3.15-2.45c-.87.58-1.98.92-3.3.92-2.54 0-4.7-1.72-5.47-4.03H3.27v2.53A9.74 9.74 0 0 0 12 21.7Z"/><path fill="#FBBC05" d="M6.53 13.78a5.86 5.86 0 0 1 0-3.56V7.69H3.27a9.74 9.74 0 0 0 0 8.62l3.26-2.53Z"/><path fill="#EA4335" d="M12 6.2c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.84 3.26 14.63 2.3 12 2.3a9.74 9.74 0 0 0-8.73 5.39l3.26 2.53C7.3 7.92 9.46 6.2 12 6.2Z"/></svg>;
}

function AuthBrand() {
  return <Link href="/home" className="inline-flex items-center gap-3 text-[#10233d] transition-opacity hover:opacity-80"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#ff6b2c] text-white shadow-lg shadow-[#ff6b2c]/20"><Flame className="h-6 w-6 fill-current" /></span><span><strong className="block text-xl font-black tracking-tight">FireGuard</strong><small className="block text-[10px] font-bold uppercase tracking-[.26em] text-[#6a7f96]">Command center</small></span></Link>;
}

function AuthShell({ mode, children }: { mode: AuthMode; children: React.ReactNode }) {
  const isRegister = mode === "register";
  return <main className="min-h-screen bg-[#f5f8fc] text-[#10233d]"><div className="grid min-h-screen lg:grid-cols-[.88fr_1.12fr]"><section className="relative overflow-hidden bg-[#edf4fc] px-6 py-8 sm:px-10 lg:px-16 lg:py-12"><div className="relative z-10 mx-auto flex h-full max-w-xl flex-col"><AuthBrand /><div className="my-auto max-w-lg py-14 lg:py-20"><p className="font-mono text-xs font-bold uppercase tracking-[.24em] text-[#ef6331]">{isRegister ? "Novo acesso" : "Acesso seguro"}</p><h1 className="mt-5 text-5xl font-black leading-[.98] tracking-[-.045em] text-[#10233d] sm:text-6xl">{isRegister ? "Crie sua conta." : "Entre na sua conta."}</h1><p className="mt-7 max-w-md text-lg leading-8 text-[#657991]">{isRegister ? "Preencha seus dados para começar a proteger sua operação." : "Acesse o centro de comando e acompanhe os riscos do seu território."}</p><div className="mt-12 space-y-7"><div className="flex gap-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#1caf8a] shadow-sm"><ShieldCheck className="h-5 w-5" /></span><p className="pt-1 text-sm leading-6 text-[#5d7289]">Seus dados são protegidos com autenticação segura.</p></div><div className="flex gap-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#1caf8a] shadow-sm"><LockKeyhole className="h-5 w-5" /></span><p className="pt-1 text-sm leading-6 text-[#5d7289]">Sua senha é armazenada com hash e nunca em texto puro.</p></div></div></div></div><div className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-[#ffb38d]/45 blur-[1px] sm:h-96 sm:w-96" /><div className="pointer-events-none absolute -bottom-40 left-28 h-64 w-52 rotate-[-22deg] rounded-[50%] bg-[#ffd0b8]/55" /></section><section className="bg-white px-6 py-8 sm:px-10 lg:px-16 lg:py-12"><div className="mx-auto max-w-xl"><div className="flex items-center justify-between gap-4"><Link href="/onboarding" className="inline-flex items-center gap-2 text-sm font-semibold text-[#6a7f96] transition-colors hover:text-[#10233d]"><ArrowLeft className="h-4 w-4" />Voltar</Link><p className="text-sm font-semibold text-[#42566d]">{isRegister ? <>Já tenho uma conta — <Link href="/login" className="font-bold text-[#e95e2d] hover:underline">Entrar</Link></> : <>Ainda não tenho conta — <Link href="/register" className="font-bold text-[#e95e2d] hover:underline">Criar conta</Link></>}</p></div>{children}</div></section></div></main>;
}

function Field({ id, label, icon: Icon, ...props }: { id: string; label: string; icon: typeof UserRound } & React.ComponentProps<typeof Input>) {
  return <div className="space-y-2"><Label htmlFor={id} className="text-sm font-bold text-[#172a42]">{label}</Label><div className="relative"><Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#91a2b5]" /><Input id={id} {...props} className="h-14 rounded-2xl border-[#d9e1e9] bg-white pl-11 text-[#10233d] shadow-[0_2px_10px_rgba(26,50,78,.03)] placeholder:text-[#9aa8b7] focus-visible:border-[#ef6331] focus-visible:ring-[#ef6331]/20" /></div></div>;
}

export function AuthPage({ mode }: { mode: AuthMode }) {
  const isRegister = mode === "register";
  const [form, setForm] = useState<RegisterForm>(initialRegisterForm);
  const [login, setLogin] = useState({ email: "", password: "" });
  const registerMutation = trpc.auth.register.useMutation({ onSuccess: () => { toast.success("Conta criada com sucesso. Bem-vindo ao FireGuard!"); window.location.href = "/dashboard"; }, onError: error => toast.error(error.message) });
  const loginMutation = trpc.auth.login.useMutation({ onSuccess: () => { toast.success("Login realizado com sucesso."); window.location.href = "/dashboard"; }, onError: error => toast.error(error.message) });
  const updateRegister = (key: keyof RegisterForm, value: string) => setForm(current => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => { event.preventDefault(); if (isRegister) { if (form.password !== form.confirmPassword) { toast.error("As senhas não coincidem."); return; } registerMutation.mutate(form); } else loginMutation.mutate(login); };
  const pending = registerMutation.isPending || loginMutation.isPending;

  return <AuthShell mode={mode}><div className="pb-8 pt-14 lg:pt-20"><form onSubmit={submit} className="space-y-5" noValidate><Button type="button" onClick={startLogin} className="h-14 w-full rounded-2xl border border-[#d9e1e9] bg-white text-base font-bold text-[#10233d] shadow-[0_4px_14px_rgba(26,50,78,.05)] hover:bg-[#f8fafc]"><GoogleMark />Continuar com o Google</Button><div className="flex items-center gap-4 py-1 text-xs font-bold uppercase tracking-[.2em] text-[#9aa8b7]"><span className="h-px flex-1 bg-[#e1e7ed]" /><span>ou</span><span className="h-px flex-1 bg-[#e1e7ed]" /></div><Button type="button" onClick={() => document.getElementById(isRegister ? "name" : "login-email")?.focus()} className="h-14 w-full rounded-2xl border border-[#bcefe2] bg-[#ecfbf7] text-base font-bold text-[#13876e] hover:bg-[#e1f8f2]"><LockKeyhole className="h-5 w-5" />Login seguro pelo FireGuard</Button>{isRegister ? <><Field id="name" label="Nome completo" icon={UserRound} type="text" autoComplete="name" required placeholder="Ex.: Ana Souza" value={form.name} onChange={event => updateRegister("name", event.target.value)} /><Field id="register-email" label="E-mail" icon={Mail} type="email" autoComplete="email" required placeholder="voce@empresa.com" value={form.email} onChange={event => updateRegister("email", event.target.value)} /><div className="grid gap-5 sm:grid-cols-2"><Field id="birthDate" label="Data de nascimento" icon={CalendarDays} type="date" autoComplete="bday" required value={form.birthDate} onChange={event => updateRegister("birthDate", event.target.value)} /><Field id="phone" label="Telefone" icon={Phone} type="tel" autoComplete="tel" required placeholder="(00) 00000-0000" value={form.phone} onChange={event => updateRegister("phone", event.target.value)} /></div><div className="grid gap-5 sm:grid-cols-2"><Field id="password" label="Senha" icon={LockKeyhole} type="password" autoComplete="new-password" required placeholder="Mínimo de 8 caracteres" value={form.password} onChange={event => updateRegister("password", event.target.value)} /><Field id="confirmPassword" label="Confirmar senha" icon={LockKeyhole} type="password" autoComplete="new-password" required placeholder="Digite a senha novamente" value={form.confirmPassword} onChange={event => updateRegister("confirmPassword", event.target.value)} /></div><p className="flex items-center gap-2 text-xs text-[#72849a]"><CheckCircle2 className="h-4 w-4 text-[#1caf8a]" />Mínimo de 8 caracteres, com letra e número.</p></> : <><Field id="login-email" label="E-mail" icon={Mail} type="email" autoComplete="email" required placeholder="voce@empresa.com" value={login.email} onChange={event => setLogin(current => ({ ...current, email: event.target.value }))} /><Field id="login-password" label="Senha" icon={LockKeyhole} type="password" autoComplete="current-password" required placeholder="Digite sua senha" value={login.password} onChange={event => setLogin(current => ({ ...current, password: event.target.value }))} /></>}<Button type="submit" disabled={pending} className="h-14 w-full rounded-2xl bg-[#ff6b2c] text-base font-black text-white shadow-lg shadow-[#ff6b2c]/20 hover:bg-[#eb5920]">{pending ? "Aguarde…" : isRegister ? "Criar conta" : "Entrar"}<ArrowRight className="ml-2 h-5 w-5" /></Button></form>{isRegister ? <p className="mt-6 text-center text-sm text-[#7a8b9e]">Já tenho uma conta — <Link href="/login" className="font-bold text-[#e95e2d] hover:underline">Entrar</Link></p> : null}</div></AuthShell>;
}

export function Register() { return <AuthPage mode="register" />; }
export function Login() { return <AuthPage mode="login" />; }
