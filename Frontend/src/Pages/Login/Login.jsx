import React, { useState } from 'react';
import { useFormik } from 'formik';
import { loginSchema } from '../../Schemas/index';
import { Link } from 'react-router-dom';
import '../Registration/Registration.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import work from '../../assets/work.jpg';
import { HOME_API } from  '../../lib/constant';

const initialValues = {
  identifier: '',
  password: '',
};

const Login = () => {
  const navigate = useNavigate();

  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
  } = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: (values, action) => {
      console.log('Login Form Values:', values);
      action.resetForm();
    },
  });

  const generateOtp = () => {
    axios
      .post(`${HOME_API}/user/generate-otp`, {
        identifier: values.identifier,
      })
      .then((data) => {
        console.log(data.data);
        if (data.data.status === 200) {
          toast.success(data.data.message);
          setOtpSent(true);
        } else {
          toast.error(data.data.message);
        }
      })
      .catch((error) => console.log(error));
  };

  const loginHandle = () => {
    axios
      .post(`${HOME_API}/user/login`, {
        identifier: values.identifier,
        password: values.password,
        otp: otp,
      })
      .then((data) => {
        // console.log(data.data);
        if (data.data.status === 200) {
          localStorage.setItem('userInfo', data.data.token);
          toast.success(data.data.message);
          navigate('/home/LandingPage');
        } else {
          toast.error(data.data.message);
        }
      })
      .catch((error) => console.log(error));
  };

  return (
    <>
      <div className="heading-tab">
        <h1>Email Marketing Tool</h1>
      </div>
      <div className="container">
        <div className="modal">
          <div className="modal-container">
            <div className="modal-left">
              <h1 className="modal-title">welcome !</h1>
              <p className="modal-desc">project - Login to your account</p>
              <ToastContainer
                position="bottom-right"
                autoClose={1000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
              />
              <form onSubmit={handleSubmit}>
                <div className="input-block">
                  <label htmlFor="identifier" className="input-label">
                    Username or Email
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    name="identifier"
                    id="identifier"
                    placeholder="Username or Email"
                    value={values.identifier}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.identifier && touched.identifier ? (
                    <p className="form-error">{errors.identifier}</p>
                  ) : null}
                </div>
                <div className="input-block">
                  <label htmlFor="password" className="input-label"  onClick={() => setShowPassword(!showPassword)}>
                    Password  👁️
                  </label>
                  <input
                  type={showPassword ? 'text' : 'password'}
                    autoComplete="off"
                    name="password"
                    id="password"
                    placeholder="Password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.password && touched.password ? (
                    <p className="form-error">{errors.password}</p>
                  ) : null}
                </div>
                {otpSent && (
                  <>
                    <div className="input-block">
                      <label htmlFor="otp" className="input-label">
                        OTP
                      </label>
                      <input
                        type="text"
                        autoComplete="off"
                        name="otp"
                        id="otp"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                    </div>
                    <div className="input-block">
                      <label htmlFor="password" className="input-label">
                        Password
                      </label>
                      <input
                        type="password"
                        autoComplete="off"
                        name="password"
                        id="password"
                        placeholder="Password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {errors.password && touched.password ? (
                        <p className="form-error">{errors.password}</p>
                      ) : null}
                    </div>
                    <div className="modal-buttons">
                      <button
                        className="input-button"
                        type="submit"
                        onClick={() => loginHandle()}
                      >
                        Login
                      </button>
                    </div>
                  </>
                )}
                <div className="modal-buttons">
                  {!otpSent ? (
                    <button
                      className="input-button"
                      type="button"
                      onClick={() => generateOtp()}
                    >
                      Generate OTP
                    </button>
                  ) : null}
                </div>
              </form>
              <p className="sign-up">
                Forgot Password? <Link to="/reset-password">Reset Now</Link>
              </p>
{/*               <p className="sign-up">
                Don't have an account? <Link to="/registration">Sign Up now</Link>
              </p> */}
            </div>
            <div className="modal-right">
              <img src={work} alt="" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
