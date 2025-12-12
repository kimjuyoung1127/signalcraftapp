(.venv) PS C:\Users\gmdqn\singalcraftapp> .\.venv\Scripts\python.exe -m app.features.audio_analysis.train_autoencoder --data_dir "C:\Users\gmdqn\singalcraftapp\data_backup\valve_normal_v1" --output_name "valve_autoencoder_v1.pth"
⚠️ Cloudflare R2 credentials are missing. Storage operations may fail.
INFO:__main__:Starting Autoencoder training...
INFO:__main__:Epoch [10/50], Loss: 0.0031
INFO:__main__:Epoch [20/50], Loss: 0.0023
INFO:__main__:Epoch [30/50], Loss: 0.0021
INFO:__main__:Epoch [40/50], Loss: 0.0018
INFO:__main__:Epoch [50/50], Loss: 0.0017
INFO:__main__:Model saved to C:\Users\gmdqn\singalcraftapp\app\models\valve_autoencoder_v1.pth
INFO:__main__:Metadata saved to C:\Users\gmdqn\singalcraftapp\app\models\valve_autoencoder_v1_meta.json
Traceback (most recent call last):
  File "C:\Users\gmdqn\AppData\Local\Programs\Python\Python310\lib\runpy.py", line 196, in _run_module_as_main
    return _run_code(code, main_globals, None,
  File "C:\Users\gmdqn\AppData\Local\Programs\Python\Python310\lib\runpy.py", line 86, in _run_code
    exec(code, run_globals)
  File "C:\Users\gmdqn\singalcraftapp\app\features\audio_analysis\train_autoencoder.py", line 243, in <module>
    train_autoencoder(args.data_dir, args.output_name)
  File "C:\Users\gmdqn\singalcraftapp\app\features\audio_analysis\train_autoencoder.py", line 224, in train_autoencoder     
    _update_model_registry(registry_entry)
  File "C:\Users\gmdqn\singalcraftapp\app\features\audio_analysis\train_autoencoder.py", line 125, in _update_model_registry
    registry_data = json.load(f)
  File "C:\Users\gmdqn\AppData\Local\Programs\Python\Python310\lib\json\__init__.py", line 293, in load
    return loads(fp.read(),
UnicodeDecodeError: 'cp949' codec can't decode byte 0xed in position 77: illegal multibyte sequence
(.venv) PS C:\Users\gmdqn\singalcraftapp> 