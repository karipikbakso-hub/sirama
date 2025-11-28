<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        //
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, \Closure $next)
    {
        // Exclude Sanctum authentication routes from CSRF verification
        if ($this->isReading($request) ||
            $this->runningUnitTests() ||
            $this->inExceptArray($request) ||
            $this->tokensMatch($request)) {
            return $this->addCookieToResponse($request, $next($request));
        }

        // For SPA authentication, exclude login/logout routes
        if ($request->is('login') || $request->is('logout') || $request->is('sanctum/csrf-cookie')) {
            return $next($request);
        }

        throw new \Illuminate\Session\TokenMismatchException('CSRF token mismatch.');
    }
}
