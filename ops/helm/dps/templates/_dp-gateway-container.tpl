#
# Container spec for dp-gateway
#
{{- define "dp-gateway-container" -}}
- name: dp-gateway
  image: {{ .Values.global.registry }}/{{ .Values.global.hwxRepository }}/{{ .Values.dpGateway.image.name }}:{{ .Values.global.dpVersion }}
  ports:
    - containerPort: 8762
  env:
    - name: CONSUL_HOST
      value: {{ .Values.consul.app.name }}-{{ .Release.Name }}-service.{{ .Values.global.namespace }}.svc.cluster.local
  volumeMounts:
    - mountPath: {{ .Values.global.certsDir }}
      name: dp-certs-volume
{{- end -}}