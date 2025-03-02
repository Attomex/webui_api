<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Validation\Rules;
use App\Services\LoggerService;

class AuthController extends Controller
{
    protected $loggerService;

    public function __construct(LoggerService $loggerService)
    {
        $this->loggerService = $loggerService;
    }

    public function login(Request $request)
    {
        // Получаем учетные данные из запроса
        $credentials = $request->only('email', 'password');

        // Проверяем, существует ли пользователь с такой почтой
        $user = User::where('email', $credentials['email'])->first();

        if (!$user) {
            // Если пользователь не найден, возвращаем ошибку
            return response()->json(['error' => 'Почта не зарегистрирована'], 404);
        }

        // Если пользователь существует, проверяем пароль
        if (!Hash::check($credentials['password'], $user->password)) {
            // Если пароль неверный, возвращаем ошибку
            return response()->json(['error' => 'Неверный пароль'], 401);
        }

        // Если почта и пароль верные, генерируем токен
        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $this->loggerService->log('Авторизация', $user->email, 'Администратор успешно авторизовался');

        // Возвращаем токен и данные пользователя
        return response()->json([
            'token' => $token,
            'user' => Auth::user()
        ]);
    }

    public function logout()
    {
        JWTAuth::invalidate(JWTAuth::getToken());
        $this->loggerService->log('Выход из системы', Auth::user()->email, 'Администратор успешно вышел из системы');
        // return response()->json(['message' => 'Successfully logged out']);
        return response()->noContent();
    }

    public function checkAuth()
    {
        try {
            // Пытаемся получить пользователя из токена
            $user = JWTAuth::parseToken()->authenticate();

            if ($user) {
                // Если пользователь найден, возвращаем успешный ответ
                return response()->json([
                    'success' => true,
                    'user' => $user,
                ], 200);
            }
        } catch (JWTException $e) {
            // Если токен невалидный или отсутствует, возвращаем ошибку
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        // Если пользователь не найден, возвращаем ошибку
        return response()->json([
            'success' => false,
            'message' => 'Unauthorized',
        ], 401);
    }

    public function register(Request $request)
    {
        $user = $request->user()->email;

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:' . User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $this->loggerService->log('Регистрация администратора', $user, [
            'email' => $request->email,
            'name' => $request->name
        ]);

        return response()->json([
            'success' => true
        ], 200);
    }

    public function getUsers()
    {
        $users = User::where('role', '=', 'Admin')->get();

        return response()->json($users);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);

        $this->loggerService->log('Удаление администратора', Auth::user()->email, [
            'name' => $user->name,
            'email' => $user->email
        ]);

        if ($user) {
            $user->delete();
            return response()->json(['message' => 'Администратор успешно удален.'], 200);
        }
    }
}
