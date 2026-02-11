import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../redux/slices/authSlice';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const Register = () => {
  const { register: registerForm, handleSubmit, watch, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      await dispatch(register(data)).unwrap();
      navigate('/');
    } catch (error) {
      //! Error handled by Redux
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Create Account
        </h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <Input
            label="Full Name"
            error={errors.name?.message}
            {...registerForm('name', { required: 'Name is required' })}
            placeholder="John Doe"
          />
          
          <Input
            label="Email"
            type="email"
            error={errors.email?.message}
            {...registerForm('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Invalid email address',
              },
            })}
            placeholder="you@example.com"
          />
          
          <Input
            label="Phone (Optional)"
            type="tel"
            {...registerForm('phone')}
            placeholder="+1 (555) 123-4567"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              I want to
            </label>
            <select
              {...registerForm('role')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              defaultValue="user"
            >
              <option value="user">Book appointments as a client</option>
              <option value="provider">Provide services</option>
            </select>
          </div>
          
          <Input
            label="Password"
            type="password"
            error={errors.password?.message}
            {...registerForm('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
            })}
            placeholder="••••••••"
          />
          
          <Input
            label="Confirm Password"
            type="password"
            error={errors.confirmPassword?.message}
            {...registerForm('confirmPassword', {
              required: 'Please confirm your password',
              validate: value => value === password || 'Passwords do not match',
            })}
            placeholder="••••••••"
          />
          
          <Button
            type="submit"
            className="w-full"
            loading={loading}
          >
            Create Account
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Register;