#
# Container spec for dp-app
#
{{- define "dp-app-container" -}}
- name: dp-app
  image: {{ .Values.global.registry }}/{{ .Values.global.hwxRepository }}/{{ .Values.dpApp.image.name }}:{{ .Values.global.dpVersion }}
  imagePullPolicy: {{ .Values.dpApp.imagePullPolicy }}
  ports:
    - containerPort: 80
    - containerPort: 443
    - containerPort: 9000
  env:
    - name: CONSUL_HOST
      value: {{ .Values.consul.app.name }}-{{ .Release.Name }}-service.{{ .Values.global.namespace }}.svc.cluster.local
    - name: CERTIFICATE_PASSWORD
      valueFrom:
        secretKeyRef:
          name: dp-knox-secret-{{ .Release.Name }}
          key: CERTIFICATE_PASSWORD
    - name: KEYSTORE_PATH
      value: {{ .Values.global.dpKeystorePath }}
    - name: KEYSTORE_PASSWORD
      valueFrom:
        secretKeyRef:
          name: dp-knox-secret-{{ .Release.Name }}
          key: KNOX_MASTER_PASSWORD
    - name: USE_TLS
      value: {{ .Values.global.useTls | quote }}
  volumeMounts:
    - mountPath: {{ .Values.global.certsDir }}
      name: dp-certs-volume
{{- end -}}