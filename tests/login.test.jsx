import { describe,expect,it,vi } from 'vitest';
import { render,screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Auth from '../components/Auth';
const login=vi.fn();const register=vi.fn();const replace=vi.fn();
vi.mock('next/navigation',()=>({useRouter:()=>({replace,push:vi.fn()})}));
vi.mock('../lib/store',()=>({useApp:()=>({login,register})}));
describe('Login UI',()=>{
 it('shows demo role options and signs in',async()=>{
  login.mockReturnValue({role:'admin'});
  render(<Auth mode="login"/>);
  expect(screen.getByText('Sign in to HRMS')).toBeInTheDocument();
  const user=userEvent.setup();
  await user.click(screen.getByRole('button',{name:'Sign In'}));
  expect(login).toHaveBeenCalledWith('admin','demo123');
  expect(replace).toHaveBeenCalledWith('/admin');
 });
 it('shows validation feedback on incorrect login',async()=>{
  login.mockImplementation(()=>{throw Error('Invalid account')});
  render(<Auth mode="login"/>);
  await userEvent.setup().click(screen.getByRole('button',{name:'Sign In'}));
  expect(screen.getByRole('alert')).toHaveTextContent('Invalid account');
 });
});
