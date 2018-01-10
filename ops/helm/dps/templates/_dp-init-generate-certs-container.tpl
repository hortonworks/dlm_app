#
# Container spec for init container for generating certificates
#
{{- define "dp-init-generate-certs-container" -}}
- name: dp-init-generate-certs
  image: {{ .Values.global.registry }}/{{ .Values.global.hwxRepository }}/{{ .Values.dpMigrate.image.name }}:{{ .Values.global.dpVersion }}
  {{- if .Values.knox.certPem }}
  command: ['cp']
  args: ['{{.Values.global.certsSourceDir}}/ssl-cert.pem', '{{.Values.global.certsSourceDir}}/ssl-key.pem', '{{ .Values.global.certsDir }}/']
  {{ else }}
  command: ['/scripts/certs-generate.sh']
  {{- end }}
  env:
    - name: CERTIFICATE_PASSWORD
      valueFrom:
        secretKeyRef:
          name: dp-knox-secret-{{ .Release.Name }}
          key: CERTIFICATE_PASSWORD
  volumeMounts:
    - mountPath: {{ .Values.global.certsDir }}
      name: dp-certs-volume
{{- if .Values.knox.certPem }}
    - mountPath: {{ .Values.global.certsSourceDir }}
      name: dp-certs-source-volume
{{- end }}
{{- end -}}