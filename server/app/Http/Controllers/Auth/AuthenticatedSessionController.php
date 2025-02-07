<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class AuthenticatedSessionController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        \Log::info("Пытаемся залогинить {$request->email}");

        // Валидация входных данных
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        \Log::info("{$request->email} прошел валидацию.");

        // Попытка аутентификации
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        \Log::info("{$request->email} прошел аутентификацию.");

        // Получаем аутентифицированного пользователя
        $user = $request->user();

        // Генерация токена
        $token = $user->createToken('auth-token for ' . $user['name'])->plainTextToken;

        \Log::info("{$request->email} получил токен.");

        // Возвращаем JSON с пользователем и токеном
        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request){
        
        $request->user()->currentAccessToken()->delete();

        return response()->noContent();
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): Response
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return response()->noContent();
    }
}
