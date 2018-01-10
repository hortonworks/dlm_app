#
# Container spec for init container for keystore initialization
#
{{- define "dp-init-keystore-container" -}}
- name: dp-init-keystore
  image: {{ .Values.global.registry }}/{{ .Values.global.hwxRepository }}/{{ .Values.dpMigrate.image.name }}:{{ .Values.global.dpVersion }}
  command: ['/scripts/keystore-update.sh']
  args:
    - "init"
  env:
    - name: MASTER_PASSWORD
      valueFrom:
        secretKeyRef:
          name: dp-knox-secret-{{ .Release.Name }}
          key: KNOX_MASTER_PASSWORD
  volumeMounts:
    - mountPath: {{ .Values.global.certsDir }}
      name: dp-certs-volume
{{- end -}}