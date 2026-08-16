import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def receive_code(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))

            file_name = data.get('file', 'Unknown')
            language = data.get('language', 'Unknown')
            line_range = data.get('lineRange', 'Unknown')
            code = data.get('code', '')

            # Prints directly to your terminal window
            print("\n" + "="*50)
            print("--- WORKLENS: RECEIVED CODE FROM VS CODE ---")
            print(f"File: {file_name}")
            print(f"Language: {language}")
            print(f"Lines: {line_range}")
            print("Code Snippet:")
            print(code)
            print("="*50 + "\n")

            return JsonResponse({
                "status": "success",
                "message": f"Successfully received {language} code snippet!",
                "received_lines": line_range
            }, status=200)

        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)

    return JsonResponse({"status": "error", "message": "Only POST requests are allowed"}, status=405)